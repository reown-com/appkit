import type { SIWXConfig, SIWXMessage, SIWXSession } from '@reown/appkit-core'
import type { SIWEConfig } from '../exports/index.js'
import { NetworkUtil, type CaipNetworkId } from '@reown/appkit-common'

export function mapToSIWX(siwe: SIWEConfig): SIWXConfig {
  return {
    async createMessage(input) {
      const params = await siwe.getMessageParams?.()

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
            chainId: NetworkUtil.caipNetworkIdToNumber(input.chainId as CaipNetworkId) || 1,
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
        throw new Error('Invalid chain ID!')
      }

      if (await siwe.verifyMessage?.(session)) {
        siwe.onSignIn?.({
          address: session.data.accountAddress,
          chainId
        })

        return Promise.resolve()
      }

      throw new Error('Failed to add session')
    },

    async revokeSession(_chainId, _address) {
      if (await siwe.signOut()) {
        return Promise.resolve()
      }

      throw new Error('Failed to sign out')
    },

    async setSessions(sessions) {
      const addingSessions = sessions.map(session => this.addSession(session))
      await Promise.all(addingSessions)
    },

    async getSessions(chainId, address) {
      try {
        const siweSession = await siwe.getSession()

        const siweCaipNetworkId = `eip155:${siweSession?.chainId}`
        if (!siweSession || siweSession.address !== address || siweCaipNetworkId !== chainId) {
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
        console.error('SIWE:getSessions - error:', error)

        return []
      }
    }
  }
}
