import * as React from 'react'
import { PageBuilder } from '@/components/page-builder'
import { AppKitProvider } from '@/providers/appkit-provider'

export default async function Component() {
  return (
    <AppKitProvider initialConfig={null}>
      <PageBuilder />
    </AppKitProvider>
  )
}
