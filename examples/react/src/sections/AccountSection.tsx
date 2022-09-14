import { AccountButton, useAccount } from '@web3modal/react'

export default function AccountSection() {
  const { chainId, address, connector, chainSupported } = useAccount()

  return (
    <section>
      <h1>Account</h1>
      <AccountButton />
      <ul>
        <li>
          ChainID: <span>{chainId}</span>
        </li>
        <li>
          Chain Supported: <span>{chainSupported ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Address: <span>{address}</span>
        </li>
        <li>
          Connector: <span>{connector}</span>
        </li>
      </ul>
    </section>
  )
}
