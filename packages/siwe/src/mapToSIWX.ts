import { ConstantsUtil, NetworkUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  type SIWXConfig,
  type SIWXMessage,
  type SIWXSession,
  getActiveCaipNetwork
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import type { AppKitSIWEClient } from '../exports/index.js'

const subscriptions: (() => void)[] = []

export function mapToSIWX(siwe: AppKitSIWEClient): SIWXConfig {
  async function getSession() {
    try {
      const response = await siwe.methods.getSession()

      if (!response) {
        return undefined
      }

      if (!response?.address) {
        throw new Error('SIWE session is missing address')
      }

      if (!response?.chainId) {
        throw new Error('SIWE session is missing chainId')
      }

      return response
    } catch (error) {
      console.warn('AppKit:SIWE:getSession - error:', error)

      return undefined
    }
  }

  let signingOut: Promise<void> | undefined = undefined

  async function signOut() {
    if (signingOut) {
      return signingOut
    }

    signingOut = (async () => {
      try {
        await siwe.methods.signOut()
        siwe.methods.onSignOut?.()
      } finally {
        signingOut = undefined
      }
    })()

    return signingOut
  }

  subscriptions.forEach(unsubscribe => unsubscribe())
  subscriptions.push(
    ChainController.subscribeKey('activeCaipAddress', async activeCaipAddress => {
      if (siwe.options.signOutOnDisconnect && !activeCaipAddress) {
        const session = await getSession()
        if (session) {
          await signOut()
        }

        return
      }

      if (activeCaipAddress) {
        const session = await getSession()

        if (session && siwe.options.signOutOnAccountChange) {
          const sessionAddress = session?.address
          const caipAddress = CoreHelperUtil?.getPlainAddress(activeCaipAddress)
          const isDifferentAddress = !HelpersUtil.isLowerCaseMatch(sessionAddress, caipAddress)

          if (isDifferentAddress) {
            await signOut()
          }
        }
      }
    })
  )

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
        const address = session.data.accountAddress
        const network = NetworkUtil.parseEvmChainId(session.data.chainId)
        siwe.methods.onSignIn?.({
          address,
          chainId: network as number
        })

        return Promise.resolve()
      }

      throw new Error('Failed to verify message')
    },

    async revokeSession(_chainId, _address) {
      try {
        await signOut()
      } catch (error) {
        console.warn('AppKit:SIWE:revokeSession - signOut error', error)
      }
    },

    async setSessions(sessions) {
      if (sessions.length === 0) {
        try {
          await signOut()
        } catch (error) {
          console.warn('AppKit:SIWE:setSessions - signOut error', error)
        }
      } else {
        /*
         * The default SIWE implementation would only support one session
         * So we only add the first session to keep backwards compatibility
         */
        const session = (sessions.find(
          s => s.data.chainId === getActiveCaipNetwork()?.caipNetworkId
        ) || sessions[0]) as SIWXSession
        await this.addSession(session)
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
        const siweCaipNetworkId = `${ConstantsUtil.CHAIN.EVM}:${siweSession?.chainId}`

        const sessionAddress = siweSession?.address
        const requestedCaipNetworkId = chainId

        const shouldSignOutOnNetworkChange = siwe.options.signOutOnNetworkChange
        const shouldSignOutOnAccountChange = siwe.options.signOutOnAccountChange

        const isNetworkMismatch =
          shouldSignOutOnNetworkChange && siweCaipNetworkId !== requestedCaipNetworkId
        const isAddressMismatch =
          shouldSignOutOnAccountChange && !HelpersUtil.isLowerCaseMatch(sessionAddress, address)

        const shouldSignOut = isNetworkMismatch || isAddressMismatch

        if (!siweSession || shouldSignOut) {
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
    },

    getRequired() {
      return siwe.options.required ?? true
    },

    signOutOnDisconnect: siwe.options.signOutOnDisconnect
  }
}
