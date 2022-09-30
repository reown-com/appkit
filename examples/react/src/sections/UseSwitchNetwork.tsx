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

      <select onChange={({ target }) => switchNetwork({ chainId: Number(target.value) })}>
        {chains.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </section>
  )
}
