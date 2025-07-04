import NextAuth from 'next-auth'
import type { Session } from 'next-auth'
import credentialsProvider from 'next-auth/providers/credentials'

import { getAddressFromMessage, getChainIdFromMessage, verifySignature } from '@reown/appkit-siwe'

const nextAuthSecret = process.env['NEXTAUTH_SECRET']
if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET is not set')
}

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// Extend the Session type to include address and chainId
interface ExtendedSession extends Session {
  address?: string
  chainId?: number
}

const providers = [
  credentialsProvider({
    name: 'Ethereum',
    credentials: {
      message: {
        label: 'Message',
        type: 'text',
        placeholder: '0x0'
      },
      signature: {
        label: 'Signature',
        type: 'text',
        placeholder: '0x0'
      }
    },
    async authorize(credentials: Partial<Record<'message' | 'signature', unknown>>) {
      try {
        const message = credentials.message as string
        const signature = credentials.signature as string
        if (!message) {
          throw new Error('SiweMessage is undefined')
        }
        const address = getAddressFromMessage(message)
        const chainId = getChainIdFromMessage(message)
        const isValid = await verifySignature({
          address,
          message,
          signature,
          chainId,
          projectId
        })

        if (isValid) {
          return {
            id: `${chainId}:${address}`
          }
        }

        return null
      } catch (e) {
        return null
      }
    }
  })
]

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: nextAuthSecret,
  providers,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session({ session, token }) {
      const extendedSession = session as ExtendedSession
      if (!token.sub) {
        return extendedSession
      }

      const [, chainId, address] = token.sub.split(':')
      if (chainId && address) {
        extendedSession.address = address
        extendedSession.chainId = parseInt(chainId, 10)
      }

      return extendedSession
    }
  }
})
