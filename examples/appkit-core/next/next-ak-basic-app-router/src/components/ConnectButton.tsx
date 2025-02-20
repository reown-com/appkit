'use client'

import { useAppKitAccount } from '@reown/appkit/react'

const compactHash = (hash: string) => {
  return hash.slice(0, 7) + '...' + hash.slice(-5)
}

export const ConnectButton = () => {
  const account = useAppKitAccount()

  const compactAddress = compactHash(account.address || '')

  return (
    <div className="column">
      <span className="text-black">useAppKitAccount: {compactAddress}</span>
      <appkit-button />
    </div>
  )
}
