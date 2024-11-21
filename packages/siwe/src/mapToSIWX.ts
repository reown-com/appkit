import {
  ChainController,
  CoreHelperUtil,
  type SIWXConfig,
  type SIWXMessage,
  type SIWXSession
} from '@reown/appkit-core'
import type { AppKitSIWEClient } from '../exports/index.js'
import { NetworkUtil } from '@reown/appkit-common'

export function mapToSIWX(siwe: AppKitSIWEClient): SIWXConfig {
  async function getSession() {
    try {
      return await siwe.methods.getSession()
    } catch (error) {
      console.warn('AppKit:SIWE:getSession - error:', error)

      return undefined
    }
  }

  ChainController.subscribeKey('activeCaipNetwork', async activeCaipNetwork => {
    if (!siwe.options.signOutOnNetworkChange) {
      return
    }

    const session = await getSession()
    const isDiffernetNetwork =
      session &&
      session.chainId !== NetworkUtil.caipNetworkIdToNumber(activeCaipNetwork?.caipNetworkId)

    if (isDiffernetNetwork) {
      await siwe.methods.signOut()
    }
  })

  ChainController.subscribeKey('activeCaipAddress', async activeCaipAddress => {
    if (!siwe.options.signOutOnAccountChange) {
      return
    }

    const session = await getSession()

    const compareSessionAddress = session?.address.toLowerCase()
    const compareCaipAddress = CoreHelperUtil?.getPlainAddress(activeCaipAddress)?.toLowerCase()

    const isDifferentAddress = session && compareSessionAddress !== compareCaipAddress

    if (isDifferentAddress) {
      await siwe.methods.signOut()
    }
  })

  return {
    async createMessage(input) {
      const params = await siwe.methods.getMessageParams?.()

      if (!params) {
        throw new Error('Failed to get message params!')
      }

      const nonce = await siwe.getNonce(input.accountAddress)
      const issuedAt = params.iat || new Date().toISOString()
      const version = '1'

      return {
        nonce,
        version,
        requestId: params.requestId,
        accountAddress: input.accountAddress,
        chainId: input.chainId,
        domain: params.domain,
        uri: params.uri,
        notBefore: params.nbf,
        resources: params.resources,
        statement: params.statement,
        expirationTime: params.exp,
        issuedAt,
        toString: () =>
          siwe.createMessage({
            ...params,
            chainId: NetworkUtil.caipNetworkIdToNumber(input.chainId) || 1,
            address: `did:pkh:${input.chainId}:${input.accountAddress}`,
            nonce,
            version,
            iat: issuedAt
          })
      }
    },

    async addSession(session) {
      const chainId = NetworkUtil.parseEvmChainId(session.data.chainId)

      if (!chainId) {
        // Workaround to ignore non-EVM chains to keep the same behavior of SIWE
        return Promise.resolve()
      }

      if (await siwe.methods.verifyMessage(session)) {
        siwe.methods.onSignIn?.({
          address: session.data.accountAddress,
          chainId: NetworkUtil.parseEvmChainId(session.data.chainId) as number
        })

        return Promise.resolve()
      }

      throw new Error('Failed to add session')
    },

    async revokeSession(_chainId, _address) {
      try {
        await siwe.methods.signOut()
        siwe.methods.onSignOut?.()
      } catch (error) {
        console.warn('AppKit:SIWE:revokeSession - signOut error', error)
      }
    },

    async setSessions(sessions) {
      if (sessions.length === 0) {
        try {
          await siwe.methods.signOut()
        } catch (error) {
          console.warn('AppKit:SIWE:setSessions - signOut error', error)
        }
      } else {
        const addingSessions = sessions.map(session => this.addSession(session))
        await Promise.all(addingSessions)
      }
    },

    async getSessions(chainId, address) {
      try {
        if (!chainId.startsWith('eip155:')) {
          // Workaround to ignore non-EVM chains to keep the same behavior of SIWE
          return [
            {
              data: {
                accountAddress: address,
                chainId
              },
              message: '',
              signature: ''
            } as SIWXSession
          ]
        }

        const siweSession = await getSession()

        const siweCaipNetworkId = `eip155:${siweSession?.chainId}`

        const compareSessionAddress = siweSession?.address.toLowerCase()
        const compareCaipAddress = address?.toLowerCase()
        if (
          !siweSession ||
          compareSessionAddress !== compareCaipAddress ||
          siweCaipNetworkId !== chainId
        ) {
          return []
        }

        const session: SIWXSession = {
          data: {
            accountAddress: siweSession.address,
            chainId: siweCaipNetworkId
          } as SIWXMessage.Data,
          message: '',
          signature: ''
        }

        return [session]
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('AppKit:SIWE:getSessions - error:', error)

        return []
      }
    }
  }
}
