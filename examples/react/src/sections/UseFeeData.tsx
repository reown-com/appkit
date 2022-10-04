import { useFeeData } from '@web3modal/react'

export default function UseFeeData() {
  const { data, error, isLoading, refetch } = useFeeData({ watch: true })

  return (
    <section>
      <h1>useFeeData</h1>

      <ul>
        <li>
          FeeData: <span>{isLoading ? 'Loading...' : JSON.stringify(data, null, 2)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch</button>
    </section>
  )
}
