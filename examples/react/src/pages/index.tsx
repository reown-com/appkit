import { ConnectButton, useAccount } from '@web3modal/react'
import AccountSection from '../sections/AccountSection'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <AccountSection />
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
