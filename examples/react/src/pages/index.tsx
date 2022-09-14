import { AccountModal, ConnectButton, useAccount } from '@web3modal/react'
// Import { AccountModal, ConnectButton, useAccount } from '@web3modal/react'
import AccountSection from '../sections/AccountSection'
import SignTypedDataSection from '../sections/SignTypedDataSection'
import SwitchChainSection from '../sections/SwitchChainSection'

export default function HomePage() {
  const { connected } = useAccount()

  return connected ? (
    <>
      <AccountSection />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* <div> */}
        <AccountModal />
      </div>
      <SwitchChainSection />
      <SignTypedDataSection />
    </>
  ) : (
    <ConnectButton />
  )
}
