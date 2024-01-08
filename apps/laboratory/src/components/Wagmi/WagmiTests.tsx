import { useAccount } from 'wagmi'
import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'

export function WagmiTests() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <WagmiSignMessageTest />
      <WagmiSignTypedDataTest />
      <WagmiTransactionTest />
    </>
  ) : null
}
