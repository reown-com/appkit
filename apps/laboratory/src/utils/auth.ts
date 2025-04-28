import { type AuthOptions, getServerSession } from 'next-auth'
import credentialsProvider from 'next-auth/providers/credentials'

import { getAddressFromMessage, getChainIdFromMessage, verifySignature } from '@reown/appkit-siwe'

export function getAuthOptions(isDefaultSigninPage: boolean | undefined): AuthOptions {
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

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return {
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

        const [, chainId, address] = token.sub.split(':')
        if (chainId && address) {
          session.address = address
          session.chainId = parseInt(chainId, 10)
        }

        return session
      }
    }
  }
}

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * @returns The session object or null
 */
export async function getSession() {
  return await getServerSession(getAuthOptions(true))
}
