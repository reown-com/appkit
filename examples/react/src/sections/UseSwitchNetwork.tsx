import { useNetwork, useSwitchNetwork } from '@web3modal/react'

export default function UseSwitchNetwork() {
  const { chains, chain } = useNetwork()
  const { error, isLoading, switchNetwork } = useSwitchNetwork()

  return (
    <section>
      <h1>useSwitchNetwork</h1>

      <ul>
        <li>
          Selected Chain: <span>{isLoading ? 'Loading...' : chain?.name}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>

      <ul>
        {chains?.map(c => (
          <li key={c.id}>
            <button onClick={async () => switchNetwork({ chainId: c.id })}>
              Switch to {c.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
