import { useEnsResolver } from 'wagmi'

export default function UseEnsName() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsResolver({ name })

  async function onRefetch() {
    await refetch()
  }

  return (
    <section>
      <h1>useEnsResolver</h1>
      <ul>
        <li>
          Name: <span>{name}</span>
        </li>
        <li>
          {/* eslint-disable-next-line no-nested-ternary */}
          Resolver Ready: <span>{isLoading ? 'Loading...' : data?.address ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onRefetch}>Refetch Name</button>
    </section>
  )
}
