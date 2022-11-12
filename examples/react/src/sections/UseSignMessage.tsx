import { useSignMessage } from 'wagmi'

export default function UseSignMessage() {
  const message = 'Hello Web3Modal'
  const { data, error, isLoading, signMessage } = useSignMessage({ message })

  function onSign() {
    signMessage()
  }

  return (
    <section>
      <h1>useSignMessage</h1>

      <ul>
        <li>
          Message: <span>{message}</span>
        </li>
        <li>
          Signature: <span>{isLoading ? 'Loading...' : data}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onSign}>Sign Message</button>
    </section>
  )
}
