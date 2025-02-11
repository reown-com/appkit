'use client'

import { useAccount } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

const compactHash = (hash: string) => {
  return hash.slice(0, 7) + '...' + hash.slice(-5)
}

export const ConnectButton = () => {
  const wagmiAccount = useAccount()
  const account = useAppKitAccount()

  const compactAddress = compactHash(account.address || '')
  const compactAddressWagmi = compactHash(wagmiAccount.address || '')

  return (
    <div className="column">
      <span className="text-black">useAppKitAccount: {compactAddress}</span>
      <span className="text-black">useAccount (wagmi): {compactAddressWagmi}</span>
      <appkit-button />
    </div>
  )
}
