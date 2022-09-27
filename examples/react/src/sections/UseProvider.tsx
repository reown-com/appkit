import { useProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()

  // eslint-disable-next-line no-console
  console.log(provider)

  return (
    <section>
      <h1>useProvider</h1>
    </section>
  )
}
