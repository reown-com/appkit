import { useFeeForMessage } from '@web3modal/react'

export default function UseFeeForMessage() {
  const { data, error, isLoading, refetch } = useFeeForMessage({
    to: '5fx8f8Fd6nD4gdXojFhgP58NiHtV6nPVeA85KjhnYdGC',
    amountInLamports: 200000,
    feePayer: 'from'
  })

  return (
    <section>
      <h1>useFeeForMessage</h1>

      <ul>
        <li>
          FeeData: <span>{isLoading ? 'Loading...' : JSON.stringify(data, null, 2)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch</button>
    </section>
  )
}
