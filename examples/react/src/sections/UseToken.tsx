import { useToken } from '@web3modal/react'

export default function UseToken() {
  const address = '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
  const { data, isLoading, error, refetch } = useToken({ address })

  return (
    <section>
      <h1>useToken</h1>
      <ul>
        <li>
          Address $ENS: <span>{address}</span>
        </li>
        <li>
          Token Data: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch Token</button>
    </section>
  )
}
