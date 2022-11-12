import { useEnsAvatar } from 'wagmi'

export default function UseEnsAvatar() {
  const name = 'vitalik.eth'
  const { data, isLoading, error, refetch } = useEnsAvatar({ addressOrName: name })

  async function onRefetch() {
    await refetch()
  }

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
      <button onClick={onRefetch}>Refetch Address</button>
    </section>
  )
}
