import { SiweMessage } from 'siwe'
import { getCsrfToken, signIn, signOut, getSession } from 'next-auth/react'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs, SIWESession } from '@web3modal/siwe'
import { createSIWEConfig } from '@web3modal/siwe'

export const siweConfig = createSIWEConfig({
  messageParams: {
    domain: 'lab.web3modal.com',
    uri: 'https://lab.web3modal.com',
    chains: [1, 56],
    resources: [
      'https://siwe.dev',
      'urn:recap:eyJhdHQiOnsiaHR0cHM6Ly93ZWIzaW5ib3guY29tIjp7InB1c2gvYWxlcnRzIjpbe31dLCJwdXNoL25vdGlmaWNhdGlvbnMiOlt7fV19fX0='
    ],
    statement: 'Test statement'
  },
  createMessage: (args: SIWECreateMessageArgs) => new SiweMessage({ ...args }).prepareMessage(),
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
