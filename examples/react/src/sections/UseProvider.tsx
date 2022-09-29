import { useProvider, useWebsocketProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()
  const websocketProvider = useWebsocketProvider()

  console.log(provider)

  return (
    <section>
      <h1>useProvider</h1>

      <ul>
        <li>Provider: {provider ? 'Yes' : `'No'`}</li>
        <li>WebsocketProvider: {websocketProvider ? 'Yes' : 'No'}</li>
      </ul>
    </section>
  )
}
