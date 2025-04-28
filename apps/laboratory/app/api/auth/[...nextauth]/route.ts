// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import nextAuth from 'next-auth'
import { NextRequest } from 'next/server'

import { type SIWESession } from '@reown/appkit-siwe'

import { getAuthOptions } from '@/src/utils/auth'

interface RouteHandlerContext {
  params: { nextauth: string[] }
}

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
async function auth(req: NextRequest, context: RouteHandlerContext) {
  const isDefaultSigninPage =
    req.method === 'GET' && req.nextUrl.searchParams.get('nextauth')?.includes('signin')

  return await nextAuth(req, context, {
    // https://next-auth.js.org/configuration/providers/oauth
    ...getAuthOptions(isDefaultSigninPage)
  })
}

export { auth as GET, auth as POST }
