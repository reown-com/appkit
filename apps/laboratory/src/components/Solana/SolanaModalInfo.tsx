import * as React from 'react'

import { AppKitInfo } from '../AppKitInfo'
import { useAppKitAccount } from '@reown/appkit/react'

export function SolanaModalInfo() {
  const { isConnected } = useAppKitAccount()

  return isConnected ? <AppKitInfo /> : null
}
