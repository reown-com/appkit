import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'

import { Session } from '@/lib/types'

// 72 hours
const EXPIRY_SECONDS = 60 * 60 * 72

interface UpdateSessionRequest {
  status: Session['status']
}

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
      } as Session),
      {
        expirationTtl: EXPIRY_SECONDS
      }
    )

    return NextResponse.json({ message: 'Session created' }, { status: 200 })
  }

  const session = JSON.parse(sessionData) as Session

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { status } = (await request.json()) as UpdateSessionRequest

  if (status !== 'success' && status !== 'error') {
    return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 })
  }

  session.status = status
  if (status === 'success') {
    // Mock txid
    session.txid = '0x9b629147b75dc0b275d478fa34d97c5d4a26926457540b15a5ce871df36c23fd'
  }

  await env.SESSIONID_STORAGE.put(sessionId, JSON.stringify(session), {
    expirationTtl: EXPIRY_SECONDS
  })

  return NextResponse.json({ message: 'Session updated' }, { status: 200 })
}
