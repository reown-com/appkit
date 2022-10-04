import { useEnsAddress } from '@web3modal/react'

export default function UseEnsAddress() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsAddress({ name })

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
      <button onClick={async () => refetch()}>Refetch Address</button>
    </section>
  )
}
