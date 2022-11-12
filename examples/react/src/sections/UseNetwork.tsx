import { useNetwork } from 'wagmi'

export default function UseNetwork() {
  const { chains, chain } = useNetwork()

  return (
    <section>
      <h1>useNetwork</h1>

      <ul>
        <li>
          Chain ID: <span>{chain?.id}</span>
        </li>
        <li>
          Selected Chain: <span>{chain?.name}</span>
        </li>
        <li>
          Configured Chains: <span>{chains.map(c => c.name).join(', ')}</span>
        </li>
      </ul>
    </section>
  )
}
