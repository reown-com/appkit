import { useAccount, useBalance } from 'wagmi'

export default function UseBalance() {
  const { address } = useAccount()
  const { data, error, isLoading, refetch } = useBalance({
    address
  })

  async function onRefetch() {
    await refetch()
  }

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
      <button onClick={onRefetch}>Refetch</button>
    </section>
  )
}
