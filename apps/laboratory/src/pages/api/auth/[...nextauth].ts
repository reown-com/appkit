import type { SIWESession } from '@web3modal/core'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { DefaultSession } from 'next-auth'
import nextAuth from 'next-auth'
import credentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'
import { ethers } from 'ethers'

declare module 'next-auth' {
  interface Session extends SIWESession {
    user?: DefaultSession['user']
  }
}

/*
 * For more information on each option (and a full list of options) go to
 * https://next-auth.js.org/configuration/options
 */
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const nextAuthSecret = process.env['NEXTAUTH_SECRET']
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
          const provider = new ethers.InfuraProvider(siwe.chainId)
          const nonce = await getCsrfToken({ req: { headers: req.headers } })
          const result = await siwe.verify(
            {
              signature: credentials?.signature || '',
              nonce
            },
            {
              provider
            }
          )

          if (result.success) {
            return {
              id: `eip155:${siwe.chainId}:${siwe.address}`
            }
          }

          return null
        } catch (e) {
          return null
        }
      }
    })
  ]

  const isDefaultSigninPage = req.method === 'GET' && req.query?.['nextauth']?.includes('signin')

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
  })
}
