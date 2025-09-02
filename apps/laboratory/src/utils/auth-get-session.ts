'use server'

import { auth } from '@/auth'

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * WARNING: Not calling the `await auth()` will cause throwing an error that mentioned and fixed here: https://github.com/nextauthjs/next-auth/issues/11076#issuecomment-2161865013
 * @returns The session object or null
 */
export async function getSession() {
  const session = await auth()

  return session
}
