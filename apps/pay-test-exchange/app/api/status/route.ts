import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type NextRequest, NextResponse } from 'next/server'

interface StatusRequest {
  sessionId: string
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext()

  const { sessionId } = await request.json<StatusRequest>()

  if (!sessionId) {
    return NextResponse.json({ error: 'No sessionId provided' }, { status: 400 })
  }

  const session = await env.SESSIONID_STORAGE.get(sessionId, {
    // Default cache ttl is 60s, we put 0 to get latest data on request
    cacheTtl: 0
  })

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(JSON.parse(session))
}
