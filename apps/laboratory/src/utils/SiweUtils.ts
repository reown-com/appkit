import { SiweMessage } from 'siwe'
import { getCsrfToken, signIn, signOut, getSession } from 'next-auth/react'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs, SIWESession } from '@web3modal/siwe'
import { createSIWEConfig } from '@web3modal/siwe'

export const siweConfig = createSIWEConfig({
  createMessage: ({ nonce, address, chainId }: SIWECreateMessageArgs) =>
    new SiweMessage({
      version: '1',
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: 'Sign in With Ethereum.'
    }).prepareMessage(),
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
      throw new Error('Failed to get session!')
    }

    const { address, chainId } = session as unknown as SIWESession

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn('credentials', {
        message,
        redirect: false,
        signature,
        callbackUrl: '/protected'
      })

      return Boolean(success?.ok)
    } catch (error) {
      return false
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false
      })

      return true
    } catch (error) {
      return false
    }
  }
})
