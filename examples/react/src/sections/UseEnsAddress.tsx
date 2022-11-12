import { useEnsAddress } from 'wagmi'

export default function UseEnsAddress() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsAddress({ name })

  async function onRefetch() {
    await refetch()
  }

  return (
    <section>
      <h1>useEnsAddress</h1>
      <ul>
        <li>
          Name: <span>{name}</span>
        </li>
        <li>
          Address: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onRefetch}>Refetch Address</button>
    </section>
  )
}
