import { useNetwork } from '@web3modal/react'

export default function UseAccountSection() {
  const { chain, chains } = useNetwork()

  return (
    <section>
      <h1>Network</h1>

      <ul>
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
