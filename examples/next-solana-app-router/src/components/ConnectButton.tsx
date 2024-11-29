'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

const compactHash = (hash: string) => {
  return hash.slice(0, 7) + '...' + hash.slice(-5)
}

export const ConnectButton = () => {
  return (
    <div className="column">
      <appkit-button />
    </div>
  )
}
