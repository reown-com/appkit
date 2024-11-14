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
  ChainController.subscribeKey('activeCaipNetwork', async activeCaipNetwork => {
    const session = await siwe.methods.getSession().catch(() => undefined)
    const isDiffernetNetwork =
      session &&
      session.chainId !== NetworkUtil.caipNetworkIdToNumber(activeCaipNetwork?.caipNetworkId)

    if (isDiffernetNetwork) {
      await siwe.methods.signOut()
    }
  })

  ChainController.subscribeKey('activeCaipAddress', async activeCaipAddress => {
    const session = await siwe.methods.getSession().catch(() => undefined)
    const isDifferentAddress =
      session && session.address !== CoreHelperUtil.getPlainAddress(activeCaipAddress)

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
        throw new Error('Invalid chain ID')
      }

      if (await siwe.verifyMessage?.(session)) {
        siwe.methods.onSignIn?.({
          address: session.data.accountAddress,
          chainId
        })

        return Promise.resolve()
      }

      throw new Error('Failed to add session')
    },

    async revokeSession(_chainId, _address) {
      if (await siwe.signOut()) {
        siwe.methods.onSignOut?.()

        return Promise.resolve()
      }

      throw new Error('Failed to sign out')
    },

    async setSessions(sessions) {
      if (sessions.length === 0) {
        await siwe.methods.signOut()
      } else {
        const addingSessions = sessions.map(session => this.addSession(session))
        await Promise.all(addingSessions)
      }
    },

    async getSessions(chainId, address) {
      try {
        const siweSession = await siwe.methods.getSession()

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
