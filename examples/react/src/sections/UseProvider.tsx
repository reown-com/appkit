import { useProvider, useWebsocketProvider } from '@web3modal/react'

export default function UseProvider() {
  const provider = useProvider()
  const websocketProvider = useWebsocketProvider()

  return (
    <section>
      <h1>useProvider</h1>

      <ul>
        <li>
          Provider: <span>{provider ? 'Yes' : `'No'`}</span>
        </li>
        <li>
          WebsocketProvider: <span>{websocketProvider ? 'Yes' : 'No'}</span>
        </li>
      </ul>
    </section>
  )
}
