import { useNetwork, useSwitchNetwork } from '@web3modal/react'

export default function UseSwitchNetwork() {
  const data = useNetwork()
  const { error, isLoading, switchNetwork } = useSwitchNetwork()

  console.log({ data })

  return (
    <section>
      <h1>useSwitchNetwork</h1>

      <ul>
        <li>
          ChainData: <span>{isLoading ? 'Loading...' : JSON.stringify(data?.cluster)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
        <li>
          {data.clusters?.map((clusterInfo: any) => {
            return (
              <button onClick={async () => switchNetwork(clusterInfo)}>{clusterInfo.name}</button>
            )
          })}
        </li>
      </ul>
    </section>
  )
}
