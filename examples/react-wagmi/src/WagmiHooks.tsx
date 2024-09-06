import * as React from 'react'
import { useAccount } from 'wagmi'

export function WagmiHooks() {
  const { isConnected, address, chainId } = useAccount()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Address: {address}</p>
          <p>Chain ID: {chainId}</p>
        </div>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  )
}
