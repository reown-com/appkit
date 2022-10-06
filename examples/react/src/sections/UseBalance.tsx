import { useAccount, useBalance } from '@web3modal/react'

export default function UseBalance() {
  const { address } = useAccount()
  const { data, error, isLoading, refetch } = useBalance({
    addressOrName: address
  })

  return (
    <section>
      <h1>useBalance</h1>

      <ul>
        <li>
          Balance Data: <span>{isLoading ? 'Loading...' : JSON.stringify(data, null, 2)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch</button>
    </section>
  )
}
