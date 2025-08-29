import CredentialsProvider from 'next-auth/providers/credentials'

import { getAddressFromMessage, getChainIdFromMessage, verifySignature } from '@reown/appkit-siwe'

// Define Session type manually
interface Session {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  expires: string
}

// Redefine AuthOptions and JWT types accurately
interface AuthOptions {
  secret: string
  providers: object[]
  session: {
    strategy: string
  }
  callbacks: {
    session: (params: { session: Session; token: JWT }) => Session
  }
}

interface JWT {
  sub?: string
}

// Define ExtendedSession type
interface ExtendedSession extends Session {
  address?: string
  chainId?: number
}

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
    // eslint-disable-next-line new-cap
    CredentialsProvider({
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
      session({ session, token }: { session: Session; token: JWT }) {
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
  }
}
