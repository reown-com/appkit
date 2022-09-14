import { ConnectButton, useAccount } from '@web3modal/react'
import AccountSection from '../sections/AccountSection'
import BalanceSection from '../sections/BalanceSection'
import EnsSection from '../sections/EnsSection'
import SignMessageSection from '../sections/SignMessageSection'
import SignTypedDataSection from '../sections/SignTypedDataSection'
import SwitchChainSection from '../sections/SwitchChainSection'
import { TransactionSection } from '../sections/TransactionSection'

export default function HomePage() {
  const { connected } = useAccount()

  return connected ? (
    <>
      <AccountSection />
      <SwitchChainSection />
      <SignTypedDataSection />
      <SignMessageSection />
      <BalanceSection />
      <TransactionSection />
      <EnsSection />
    </>
  ) : (
    <ConnectButton />
  )
}
