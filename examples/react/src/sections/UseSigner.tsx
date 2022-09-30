import { useSigner } from '@web3modal/react'

export default function UseSigner() {
  const { data, error, isLoading, refetch } = useSigner()

  return (
    <section>
      <h1>useSigner</h1>

      <ul>
        <li>
          {/* eslint-disable */}
          Signer Ready: <span>{isLoading ? 'Loading...' : data?._isSigner ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch</button>
    </section>
  )
}
