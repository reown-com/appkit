import { ConnectButton, useAccount } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseBlockNumber from '../sections/UseBlockNumber'
import UseDisconnect from '../sections/UseDisconnect'
import UseNetwork from '../sections/UseNetwork'
import UseProvider from '../sections/UseProvider'
import UseSigner from '../sections/UseSigner'
import UseSignMessage from '../sections/UseSignMessage'
import UseSignTypedData from '../sections/UseSignTypedData'

export default function HomePage() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <>
      <UseAccount />
      <UseDisconnect />
      <UseNetwork />
      <UseBlockNumber />
      <UseBalance />
      <UseProvider />
      <UseSigner />
      <UseSignMessage />
      <UseSignTypedData />
    </>
  ) : (
    <ConnectButton />
  )
}
