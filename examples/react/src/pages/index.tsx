import { AccountButton, ConnectButton, useAccount } from '@web3modal/react'

export default function HomePage() {
  const { chainId, connected, address } = useAccount()

  return <div>{connected ? <AccountButton /> : <ConnectButton />}</div>
}
