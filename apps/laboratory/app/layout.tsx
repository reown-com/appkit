import * as React from 'react'

import type { Metadata } from 'next'

import Layout from '@/src/layout'
import { bootstrapSentry } from '@/src/utils/SentryUtil'
import { getSession } from '@/src/utils/auth'

bootstrapSentry()

export const metadata: Metadata = {
  title: 'AppKit Lab',
  description: "AppKit Lab is the test environment for Reown's AppKit",
  openGraph: {
    title: 'AppKit Lab',
    description: "AppKit Lab is the test environment for Reown's AppKit",
    url: 'https://appkit-lab.reown.com/',
    type: 'website'
  },
  icons: {
    icon: '/logo.png'
  }
}

export default async function App({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html>
      <body>
        <Layout session={session}>{children}</Layout>
      </body>
    </html>
  )
}
