import { ConnectButton, useAccount } from '@web3modal/solid'
import AccountSection from '../sections/AccountSection'
import BalanceSection from '../sections/BalanceSection'
import EnsSection from '../sections/EnsSection'
import SignMessageSection from '../sections/SignMessageSection'
import SignTypedDataSection from '../sections/SignTypedDataSection'
import SwitchChainSection from '../sections/SwitchChainSection'
import { TransactionSection } from '../sections/TransactionSection'

export default function HomePage() {
  const account = useAccount()

  return account().connected ? (
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
