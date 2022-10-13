import { useAccount } from '@web3modal/react'

export default function UseAccount() {
  const { account } = useAccount()

  return (
    <section>
      <h1>useAccount</h1>
      <ul>
        <li>
          Connected: <span>{account.isConnected ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Connector: <span>{account.connector?.id}</span>
        </li>
        <li>
          Address: <span>{account.address}</span>
        </li>
      </ul>
    </section>
  )
}
