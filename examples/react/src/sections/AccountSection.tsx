import { AccountButton, useAccount } from '@web3modal/react'

export default function AccountSection() {
  const { address, connector, isConnected } = useAccount()

  return (
    <section>
      <h1>Account</h1>
      <AccountButton />
      <ul>
        <li>
          Connected: <span>{isConnected}</span>
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
