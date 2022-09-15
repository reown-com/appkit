import { ConnectButton, useAccount } from '@web3modal/react'
// Import { AccountModal, ConnectButton, useAccount } from '@web3modal/react'
import AccountSection from '../sections/AccountSection'
import SignTypedDataSection from '../sections/SignTypedDataSection'
import SwitchChainSection from '../sections/SwitchChainSection'

export default function HomePage() {
  const { connected } = useAccount()

  return connected ? (
    <>
      <AccountSection />
      {/* <AccountModal /> */}
      <SwitchChainSection />
      <SignTypedDataSection />
    </>
  ) : (
    <ConnectButton />
  )
}
