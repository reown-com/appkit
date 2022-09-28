import { useProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()

  return (
    <section>
      <h1>useProvider: {typeof provider}</h1>
    </section>
  )
}
