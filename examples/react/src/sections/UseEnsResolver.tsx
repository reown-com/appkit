import { useEnsResolver } from '@web3modal/react'

export default function UseEnsName() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsResolver({ name })

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
      <button onClick={async () => refetch()}>Refetch Name</button>
    </section>
  )
}
