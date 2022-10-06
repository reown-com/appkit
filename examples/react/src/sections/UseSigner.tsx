import { useSigner } from '@web3modal/react'
import { useCallback, useEffect } from 'react'

export default function UseSigner() {
  const { data, error, isLoading, refetch } = useSigner()

  const onGetNetwork = useCallback(async () => {
    const network = await data?.provider?.getNetwork()
    // eslint-disable-next-line no-console
    console.log('network', network)
  }, [data])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(data)
    if (data) onGetNetwork()
  }, [data])

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
