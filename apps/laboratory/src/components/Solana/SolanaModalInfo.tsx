import * as React from 'react'

import { useAppKitAccount } from '@reown/appkit/react'

import { AppKitInfo } from '@/src/components/AppKitInfo'

export function SolanaModalInfo() {
  const { isConnected } = useAppKitAccount()

  return isConnected ? <AppKitInfo /> : null
}
