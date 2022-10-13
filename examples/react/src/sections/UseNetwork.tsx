import { useNetwork } from '@web3modal/react'

export default function UseNetwork() {
  const { network } = useNetwork()

  return (
    <section>
      <h1>useNetwork</h1>

      <ul>
        <li>
          Chain ID: <span>{network?.chain?.id}</span>
        </li>
        <li>
          Selected Chain: <span>{network?.chain?.name}</span>
        </li>
        <li>
          Configured Chains: <span>{network?.chains.map(c => c.name).join(', ')}</span>
        </li>
      </ul>
    </section>
  )
}
