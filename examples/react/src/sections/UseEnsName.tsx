import { useEnsName } from '@web3modal/react'

export default function UseEnsName() {
  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  const { data, isLoading, error, refetch } = useEnsName({ address })

  return (
    <section>
      <h1>useEnsName</h1>
      <ul>
        <li>
          Address: <span>{address}</span>
        </li>
        <li>
          Name: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch Name</button>
    </section>
  )
}
