import * as React from 'react'

import Layout from '@/src/layout'
import { bootstrapSentry } from '@/src/utils/SentryUtil'
import { getSession } from '@/src/utils/auth'

bootstrapSentry()

export default async function App({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html>
      <title>AppKit Lab</title>
      <meta name="description" content="AppKit Lab" />
      <meta property="og:title" content="AppKit Lab" />
      <meta property="og:description" content="AppKit Lab" />
      <meta property="og:image" content="https://appkit.reown.com/og-image.png" />
      <meta property="og:url" content="https://appkit.reown.com" />
      <meta property="og:type" content="website" />
      <link rel="icon" href="/favicon.svg" />
      <body>
        <Layout session={session}>{children}</Layout>
      </body>
    </html>
  )
}
