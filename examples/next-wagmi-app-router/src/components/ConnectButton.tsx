'use client'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useAccount, use } from 'wagmi'

const compactHash = (hash: string) => {
  return hash.slice(0, 7) + '...' + hash.slice(-5)
}

export const ConnectButton = () => {
  const wagmiAccount = useAccount()
  const account = useAppKitAccount()
  const network = useAppKitNetwork()
  const networkWagmi = wagmiAccount.chainId

  const compactAddress = compactHash(account.address || '')
  const compactAddressWagmi = compactHash(wagmiAccount.address || '')

  return (
    <div className="column">
      <span className="text-black">useAppKitAccount: {compactAddress}</span>
      <span className="text-black">useAccount (wagmi): {compactAddressWagmi}</span>
      <span className="text-black">useAppKitNetwork: {network.chainId}</span>
      <span className="text-black">useAccount (wagmi): {networkWagmi}</span>
      <appkit-button />
    </div>
  )
}
