import { AccountButton, ConnectButton, useAccount } from '@web3modal/react'

export default function HomePage() {
  const { chainId, connected, address } = useAccount()

  console.log(chainId, connected, address)

  return connected ? <AccountButton /> : <ConnectButton />
}
