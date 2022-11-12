import { useBlockNumber } from 'wagmi'

export default function UseBlockNumber() {
  const { data, error, isLoading, refetch } = useBlockNumber({ watch: true })

  async function onRefetch() {
    await refetch()
  }

  return (
    <section>
      <h1>useBlockNumber</h1>

      <ul>
        <li>
          BlockNumber: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onRefetch}>Refetch</button>
    </section>
  )
}
