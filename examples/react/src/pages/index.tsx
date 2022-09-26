import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccountSection from '../sections/UseAccountSection'
import UseNetworkSection from '../sections/UseNetworkSection'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <UseAccountSection />
      <UseNetworkSection />
      {/* <SwitchChainSection />
      <SignTypedDataSection />
      <SignMessageSection />
      <BalanceSection />
      <TransactionSection />
      <EnsSection /> */}
    </>
  ) : (
    <ConnectButton />
  )
}
