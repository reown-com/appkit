import { useTransaction } from '@web3modal/react'

export default function UseTransaction() {
  const hash = '0xdb27fcc11c8c697ca7d4589606ca58a8c3681d422a5fc79eeb115f09b9523d88'
  const { data, isLoading, error, refetch } = useTransaction({ hash })

  return (
    <section>
      <h1>useTransaction</h1>
      <ul>
        <li>
          TX hash: <span>{hash}</span>
        </li>
        <li>
          Transaction Data: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch Transaction</button>
    </section>
  )
}
