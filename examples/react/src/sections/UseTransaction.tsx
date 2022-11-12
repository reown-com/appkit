import { useTransaction } from 'wagmi'

export default function UseTransaction() {
  const hash = '0xe75fb554e433e03763a1560646ee22dcb74e5274b34c5ad644e7c0f619a7e1d0'
  const { data, isLoading, error, refetch } = useTransaction({ hash })

  async function onRefetch() {
    await refetch()
  }

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
      <button onClick={onRefetch}>Refetch Transaction</button>
    </section>
  )
}
