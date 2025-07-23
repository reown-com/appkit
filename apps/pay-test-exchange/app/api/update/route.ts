import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest } from 'next/server'

import { Session } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext()

  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return new Response('No sessionId provided', { status: 400 })
  }

  const sessionData = await env.SESSIONID_STORAGE.get(sessionId)

  if (!sessionData) {
    await env.SESSIONID_STORAGE.put(
      sessionId,
      JSON.stringify({
        status: 'pending',
        createdAt: new Date().toISOString()
      } as Session)
    )

    return new Response('Session created', { status: 200 })
  }

  let session = JSON.parse(sessionData) as Session

  const { status } = (await request.json()) as Pick<Session, 'status'>

  if (status !== 'success' && status !== 'error') {
    return new Response('Invalid status provided', { status: 400 })
  }

  session.status = status
  if (status === 'success') {
    session.txid = '1234567890'
  }

  await env.SESSIONID_STORAGE.put(sessionId, JSON.stringify(session))

  return new Response('Session updated', { status: 200 })
}
