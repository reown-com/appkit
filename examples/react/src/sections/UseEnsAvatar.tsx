import { useEnsAvatar } from '@web3modal/react'

export default function UseEnsAvatar() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsAvatar({ addressOrName: name })

  return (
    <section>
      <h1>useEnsAvatar</h1>
      <ul>
        <li>
          Name: <span>{name}</span>
        </li>
        <li>
          Avatar: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch Address</button>
    </section>
  )
}
