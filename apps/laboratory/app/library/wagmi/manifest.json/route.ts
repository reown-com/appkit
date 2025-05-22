// app/library/wagmi/manifest.json/route.ts
import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    {
      name: 'AppKit Laboratory',
      description: 'Laboratory application for AppKit to test and develop features',
      iconPath: '/logo.png',
      safeAppVersion: '1.0.0'
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}
