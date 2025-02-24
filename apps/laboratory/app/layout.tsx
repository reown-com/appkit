import * as React from 'react'

import Layout from '@/src/layout'
import { bootstrapSentry } from '@/src/utils/SentryUtil'
import { getSession } from '@/src/utils/auth'

bootstrapSentry()

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
