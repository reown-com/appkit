import { useNetwork } from '@web3modal/react'

export default function UseNetwork() {
  const { cluster } = useNetwork()

  return (
    <section>
      <h1>useNetwork</h1>

      <ul>
        <li>
          Chain data: <span>{JSON.stringify(cluster)}</span>
        </li>
      </ul>
    </section>
  )
}
