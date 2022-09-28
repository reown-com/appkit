import { useBlockNumber } from '@web3modal/react'

export default function UseBlockNumber() {
  useBlockNumber()

  return (
    <section>
      <h1>useBlockNumber</h1>

      {/* <ul>
        <li>
          BlockNumber: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
        <button onClick={async () => refetch()}>Refetch</button>
      </ul> */}
    </section>
  )
}
