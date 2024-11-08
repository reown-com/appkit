import type { SIWXConfig, SIWXMessage, SIWXSession } from '@reown/appkit-core'
import type { SIWEConfig } from '../exports/index.js'
import { DefaultSIWX, InformalMessenger } from '@reown/appkit-siwx'
import { NetworkUtil } from '@reown/appkit-common'

export async function mapToSIWX(siwe: SIWEConfig): Promise<SIWXConfig> {
  const params = await siwe.getMessageParams?.()

  const domain = params?.domain || 'Unknown Domain'
  const uri = params?.uri || 'Unknown URI'

  const messenger = new InformalMessenger({
    domain,
    uri,
    expiration: params?.expiry,
    getNonce: ({ accountAddress }) => siwe.getNonce(accountAddress)
  })

  return new DefaultSIWX({
    messenger,

    verifiers: [
      {
        chainNamespace: 'eip155',
        shouldVerify: session => session.data.chainId.startsWith('eip155'),
        verify: async session => {
          const success = await siwe.verifyMessage({
            message: session.message.toString(),
            signature: session.signature
          })

          return success
        }
      }
    ],

    storage: {
      add: async session => {
        const chainId = NetworkUtil.parseEvmChainId(session.data.chainId)

        if (!chainId) {
          throw new Error('Invalid chain ID!')
        }

        siwe.onSignIn?.({
          address: session.data.accountAddress,
          chainId
        })

        return Promise.resolve()
      },

      get: async (chainId, address) => {
        try {
          const siweSession = await siwe.getSession()
          const siweCaipNetworkId = `eip155:${siweSession?.chainId}`
          if (!siweSession || siweSession.address !== address || siweCaipNetworkId !== chainId) {
            return []
          }

          // How should we parse the session?
          const session: SIWXSession = {
            data: {
              accountAddress: siweSession.address,
              chainId: siweCaipNetworkId
            } as SIWXMessage.Data,
            message: '',
            signature: ''
          }

          return [session]
        } catch {
          return []
        }
      },

      set: async () => Promise.resolve(),

      delete: async () => {
        if (await siwe.signOut()) {
          return Promise.resolve()
        }

        throw new Error('Failed to sign out!')
      }
    }
  })
}
