import { useEffect, useState } from 'react'
import { useProvider, useWebSocketProvider } from 'wagmi'

export default function UseProvider() {
  const provider = useProvider()
  const websocketProvider = useWebSocketProvider()
  const [providerReady, setProviderReady] = useState(false)

  async function onProvider() {
    const ready = await provider.ready
    setProviderReady(Boolean(ready))
  }

  useEffect(() => {
    onProvider()
  }, [])

  return (
    <section>
      <h1>useProvider</h1>

      <ul>
        <li>
          Provider Ready: <span>{providerReady}</span>
        </li>
        <li>
          WebsocketProvider Ready: <span>{websocketProvider ? 'Yes' : 'No'}</span>
        </li>
      </ul>
    </section>
  )
}
