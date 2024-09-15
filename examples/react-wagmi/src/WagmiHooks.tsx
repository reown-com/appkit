import { useAppKitAccount } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

export function WagmiHooks() {
  const { address } = useAppKitAccount()
  const { isConnected, chainId } = useAccount()

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
