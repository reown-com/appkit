import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseBlockNumber from '../sections/UseBlockNumber'
import UseNetwork from '../sections/UseNetwork'
import UseProvider from '../sections/UseProvider'

export default function HomePage() {
  const { isConnected } = useAccount()

  // eslint-disable-next-line no-console
  console.log('Render')

  return isConnected ? (
    <>
      <UseAccount />
      <UseNetwork />
      <UseBlockNumber />
      <UseBalance />
      <UseProvider />
    </>
  ) : (
    <ConnectButton />
  )
}
