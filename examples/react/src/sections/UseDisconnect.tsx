import { useDisconnect } from '@web3modal/react'

export default function UseAccount() {
  const disconnect = useDisconnect()

  return (
    <section>
      <h1>useDisconnect</h1>
      <button onClick={disconnect}>Disconnect</button>
    </section>
  )
}
