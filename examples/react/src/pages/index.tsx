import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseSendTransaction from '../sections/UseSendTransaction'
import UseSignMessage from '../sections/UseSignMessage'
import UseTransaction from '../sections/UseTransaction'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <UseAccount />
      <UseBalance />
      <UseTransaction />
      <UseSendTransaction />
      <UseSignMessage />
    </>
  ) : (
    <ConnectButton />
  )
}
