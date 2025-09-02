import { getCsrfToken, signIn, signOut } from 'next-auth/react'

import type { SIWECreateMessageArgs, SIWESession, SIWEVerifyMessageArgs } from '@reown/appkit-siwe'
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe'

import { getSession } from '@/src/utils/auth-get-session'

import { ConstantsUtil } from './ConstantsUtil'

const chains = ConstantsUtil.EvmNetworks

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  signOutOnDisconnect: true,
  // We don't require any async action to populate params but other apps might
  // eslint-disable-next-line @typescript-eslint/require-await
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: chains.map(chain => chain.id as number),
    statement: 'Please sign with your account',
    iat: new Date().toISOString()
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
  getNonce: async () => {
    const nonce = await getCsrfToken()
    if (!nonce) {
      throw new Error('Failed to get nonce!')
    }

    return nonce
  },
  getSession: async () => {
    const session = await getSession()
    if (!session) {
      return null
    }

    const { address, chainId } = session as unknown as SIWESession

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature, cacao }: SIWEVerifyMessageArgs) => {
    try {
      /*
       * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
       * When personal_sign fallback is used, cacao will be undefined
       */
      if (cacao) {
        // Do something
      }
      const success = await signIn('credentials', {
        message,
        redirect: false,
        signature,
        callbackUrl: '/protected'
      })

      return Boolean(success?.ok)
    } catch (error) {
      console.warn('@@siweConfig: verifyMessage error', error)

      return false
    }
  },
  signOut: async () => {
    try {
      await signOut({ redirect: false })
      // Some times the first signOut doesn't delete the cookie, so we need to sign out again
      const session = await getSession()
      if (session) {
        await signOut({ redirect: false })
      }

      return true
    } catch (error) {
      console.warn('@@siweConfig: signOut error', error)

      return false
    }
  },
  onSignOut() {
    const element = document.querySelector("[data-testid='siwe-event-onSignOut']")
    if (element) {
      element.textContent = 'true'
    }
  },
  onSignIn() {
    const element = document?.querySelector("[data-testid='siwe-event-onSignIn']")
    if (element) {
      element.textContent = 'true'
    }
  }
})
