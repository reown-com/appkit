import { AccountButton, useAccount } from '@web3modal/react'

export default function UseAccountSection() {
  const { address, connector, isConnected } = useAccount()

  return (
    <section>
      <h1>useAccount</h1>
      <AccountButton />
      <ul>
        <li>
          Connected: <span>{isConnected ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Connector: <span>{connector?.id}</span>
        </li>
        <li>
          Address: <span>{address}</span>
        </li>
      </ul>
    </section>
  )
}
