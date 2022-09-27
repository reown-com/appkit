import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBlockNumber from '../sections/UseBlockNumber'
import UseNetwork from '../sections/UseNetwork'
import UseProvider from '../sections/UseProvider'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <UseAccount />
      <UseNetwork />
      <UseBlockNumber />
      <UseProvider />
    </>
  ) : (
    <ConnectButton />
  )
}
