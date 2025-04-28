import NextAuth, { type NextAuthConfig } from 'next-auth'
import credentialsProvider from 'next-auth/providers/credentials'

import { getAddressFromMessage, getChainIdFromMessage, verifySignature } from '@reown/appkit-siwe'

function getSiweProvider() {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }

  return credentialsProvider({
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
    async authorize(credentials) {
      try {
        if (!credentials?.message) {
          throw new Error('SiweMessage is undefined')
        }
        const { message, signature } = credentials
        const address = getAddressFromMessage(message as string)
        const chainId = getChainIdFromMessage(message as string)

        const isValid = await verifySignature({
          address,
          message: message as string,
          signature: signature as string,
          chainId,
          projectId
        })

        if (isValid) {
          const user = {
            id: `${chainId}:${address}`
          }

          return user
        }

        return null
      } catch (e) {
        return null
      }
    }
  })
}

export function getAuthOptions() {
  const nextAuthSecret = process.env['AUTH_SECRET']

  if (!nextAuthSecret) {
    throw new Error('AUTH_SECRET is not set')
  }

  const config = {
    secret: nextAuthSecret,
    providers: [getSiweProvider()],
    session: {
      strategy: 'jwt'
    },
    callbacks: {
      session({ session, token }) {
        if (!token.sub) {
          return session
        }

        const [, chainId, address] = token.sub.split(':')
        if (chainId && address) {
          // @ts-expect-error session type should be overridden to handle address and chainId
          session.address = address
          // @ts-expect-error session type should be overridden to handle address and chainId
          session.chainId = parseInt(chainId, 10)
        }

        return session
      }
    },
    trustHost: true
  } satisfies NextAuthConfig

  return config
}

// eslint-disable-next-line new-cap
export const { auth, handlers, signIn, signOut } = NextAuth(getAuthOptions())
