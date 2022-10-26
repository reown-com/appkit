import { useAccount } from '@web3modal/react'

export default function UseAccount() {
  const { address, isConnected } = useAccount()

  return (
    <section>
      <h1>useAccount</h1>
      <ul>
        <li>
          Connected: <span>{isConnected ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Address: <span>{address}</span>
        </li>
      </ul>
    </section>
  )
}
