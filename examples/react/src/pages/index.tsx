import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseSignMessage from '../sections/UseSignMessage'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <UseAccount />
      <UseBalance />
      <UseSignMessage />
    </>
  ) : (
    <ConnectButton />
  )
}
