import { useProvider, useWebsocketProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()
  const websocketProvider = useWebsocketProvider()

  // eslint-disable-next-line no-console
  console.log('useProvider', provider)
  // eslint-disable-next-line no-console
  console.log('websocketProvider', websocketProvider)

  return (
    <section>
      <h1>useProvider</h1>

      <p>Check console for provider object log</p>
    </section>
  )
}
