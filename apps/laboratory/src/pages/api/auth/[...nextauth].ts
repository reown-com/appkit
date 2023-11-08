import nextAuth from 'next-auth'
import credentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'

const nextAuthSecret = process.env['NEXTAUTH_SECRET']
const nextAuthUrl = process.env.NEXTAUTH_URL

/*
 * For more information on each option (and a full list of options) go to
 * https://next-auth.js.org/configuration/options
 */
export default async function auth(req: any, res: any) {
  if (!nextAuthUrl) {
    throw new Error('NEXTAUTH_URL is not set')
  }
  if (!nextAuthSecret) {
    throw new Error('NEXTAUTH_SECRET is not set')
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
          const siwe = new SiweMessage(credentials.message)
          const url = new URL(nextAuthUrl)

          const nonce = await getCsrfToken({ req })
          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: url.host,
            nonce
          })

          if (result.success) {
            return {
              id: `eip155:${siwe.chainId}:${siwe.address}`
            }
          }

          return null
        } catch (e) {
          // TODO: handle error case
          console.log(e)

          return null
        }
      }
    })
  ]

  const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await nextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: 'jwt'
    },
    secret: nextAuthSecret,
    callbacks: {
      session({ session, token }: { session: any; token: any }) {
        const [, chainId, address] = token.sub.split(':')
        session.user.name = address
        session.address = address
        session.chainId = parseInt(chainId, 10)

        return session
      }
    }
  })
}
