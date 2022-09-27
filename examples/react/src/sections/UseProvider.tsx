import { useProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()
  console.log(provider)

  return (
    <section>
      <h1>useProvider</h1>

      <ul>
        <li>
          Chain ID: <span>???</span>
        </li>
      </ul>
    </section>
  )
}
