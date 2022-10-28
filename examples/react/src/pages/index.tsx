import { ConnectButton, useAccount } from '@web3modal/react'
import UseDisconnect from '../sections/UseDisconnect'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseFeeForMessage from '../sections/UseFeeForMessage'
import UseNetwork from '../sections/UseNetwork'
import UseSendTransaction from '../sections/UseSendTransaction'
import UseSignMessage from '../sections/UseSignMessage'
import UseSnsName from '../sections/UseSns'
import UseSwitchNetwork from '../sections/UseSwitchNetwork'
import UseTransaction from '../sections/UseTransaction'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <div className="main">
      <UseDisconnect />
      <UseAccount />
      <UseBalance />
      <UseTransaction />
      <UseSendTransaction />
      <UseSignMessage />
      <UseSnsName />
      <UseNetwork />
      <UseSwitchNetwork />
      <UseFeeForMessage />
    </div>
  ) : (
    <ConnectButton />
  )
}
