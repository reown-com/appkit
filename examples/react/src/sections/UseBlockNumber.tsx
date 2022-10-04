import { useBlockNumber } from '@web3modal/react'

export default function UseBlockNumber() {
  const { data, error, isLoading, refetch } = useBlockNumber({ watch: true })

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
      <button onClick={async () => refetch()}>Refetch</button>
    </section>
  )
}
