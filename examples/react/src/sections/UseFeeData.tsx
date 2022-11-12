import { useFeeData } from 'wagmi'

export default function UseFeeData() {
  const { data, error, isLoading, refetch } = useFeeData({ watch: true })

  async function onRefetch() {
    await refetch()
  }

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
      <button onClick={onRefetch}>Refetch</button>
    </section>
  )
}
