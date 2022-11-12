import { useAccount } from 'wagmi'

export default function UseAccount() {
  const { isConnected, connector, address } = useAccount()

  return (
    <section>
      <h1>useAccount</h1>
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
