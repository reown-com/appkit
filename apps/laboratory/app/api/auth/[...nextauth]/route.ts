import type { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'

import { type SIWESession } from '@reown/appkit-siwe'

import { getAuthOptions } from '@/src/utils/auth'

declare module 'next-auth' {
  interface Session extends SIWESession {
    address: string
    chainId: number
  }
}
/*
 * For more information on each option (and a full list of options) go to
 * https://next-auth.js.org/configuration/options
 */
async function auth(req: NextApiRequest, res: NextApiResponse) {
  const nextAuthSecret = process.env['NEXTAUTH_SECRET']
  if (!nextAuthSecret) {
    throw new Error('NEXTAUTH_SECRET is not set')
  }
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }

  const isDefaultSigninPage =
    req.method === 'GET' && req.query?.['nextauth']?.includes('signin') ? true : false

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    ...(await getAuthOptions(isDefaultSigninPage))
  })
}

export { auth as GET, auth as POST }
