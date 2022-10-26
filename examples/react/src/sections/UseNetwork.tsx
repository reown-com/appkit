import { useNetwork } from '@web3modal/react'

export default function UseNetwork() {
  const data = useNetwork()

  return (
    <section>
      <h1>useNetwork</h1>

      <ul>
        <li>
          {'cluster' in data && (
            <span>
              Chain data: <span>{JSON.stringify(data.cluster)}</span>
            </span>
          )}
        </li>
      </ul>
    </section>
  )
}
