import type { NextApiRequest, NextApiResponse } from 'next'
import nextAuth from 'next-auth'

import { type SIWESession } from '@reown/appkit-siwe'

import { getAuthOptions } from '@/src/utils/auth'

type NextRequest = Request & NextApiRequest
type NextResponse = Response & NextApiResponse

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
async function auth(req: NextRequest, res: NextResponse) {
  const isDefaultSigninPage = req.method === 'GET' && req.query?.['nextauth']?.includes('signin')

  return await nextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    ...getAuthOptions(isDefaultSigninPage)
  })
}

export { auth as GET, auth as POST }
