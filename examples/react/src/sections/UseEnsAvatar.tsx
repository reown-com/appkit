import { useEnsAvatar } from 'wagmi'

export default function UseEnsAvatar() {
  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  const { data, isLoading, error, refetch } = useEnsAvatar({
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  })

  async function onRefetch() {
    await refetch()
  }

  return (
    <section>
      <h1>useEnsAvatar</h1>
      <ul>
        <li>
          Name: <span>{address}</span>
        </li>
        <li>
          Avatar: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onRefetch}>Refetch Avatar</button>
    </section>
  )
}
