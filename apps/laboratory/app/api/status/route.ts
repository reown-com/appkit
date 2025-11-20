import { NextRequest, NextResponse } from 'next/server'

interface StatusResponse {
  status: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    // Extract requestId from query parameters
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    // Validate requestId
    if (!requestId) {
      return NextResponse.json({ error: 'Missing required parameter: requestId' }, { status: 400 })
    }

    // Validate requestId format (should be a hex string starting with 0x)
    if (!requestId.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid requestId format. Must be a hex string starting with 0x' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line no-console
    console.log('Fetching status for requestId:', requestId)

    // Call Relay.link status API
    const relayResponse = await fetch(
      `https://api.relay.link/intents/status/v3?requestId=${encodeURIComponent(requestId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!relayResponse.ok) {
      const errorText = await relayResponse.text()
      // eslint-disable-next-line no-console
      console.error('Relay.link status API error:', errorText)

      return NextResponse.json(
        {
          error: 'Failed to fetch status from Relay.link',
          details: errorText,
          requestId
        },
        { status: relayResponse.status }
      )
    }

    const statusData: StatusResponse = await relayResponse.json()

    // Return the status data
    return NextResponse.json(statusData, { status: 200 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Status API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
