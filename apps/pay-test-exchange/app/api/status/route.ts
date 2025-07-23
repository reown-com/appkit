import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext()

  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return new Response('No sessionId provided', { status: 400 })
  }

  const session = await env.SESSIONID_STORAGE.get(sessionId)

  if (!session) {
    return new Response('Session not found', { status: 404 })
  }

  return new Response(session)
}
