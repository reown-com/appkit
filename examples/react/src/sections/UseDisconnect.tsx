import { useDisconnect } from 'wagmi'

export default function UseAccount() {
  const { disconnect } = useDisconnect()

  function onDisconnect() {
    disconnect()
  }

  return (
    <section>
      <h1>useDisconnect</h1>
      <button onClick={onDisconnect}>Disconnect</button>
    </section>
  )
}
