import type { NextAuthConfig } from 'next-auth'
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
    async authorize(credentials) {
      try {
        if (!credentials?.message) {
          throw new Error('SiweMessage is undefined')
        }
        const { message, signature } = credentials
        const address = getAddressFromMessage(JSON.stringify(message))
        const chainId = getChainIdFromMessage(JSON.stringify(message))
        const isValid = await verifySignature({
          address,
          message: JSON.stringify(message),
          signature: JSON.stringify(signature),
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

export default {
  secret: nextAuthSecret,
  providers,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session({ session, token }) {
      if (!token.sub) {
        return session
      }

      return session
    }
  },
  trustHost: true
} satisfies NextAuthConfig
