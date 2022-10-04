import { useSignMessage } from '@web3modal/react'

export default function UseSignMessage() {
  const message = 'Hello Web3Modal'
  const { data, error, isLoading, signMessage } = useSignMessage({ message })

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
      <button onClick={async () => signMessage()}>Sign Message</button>
    </section>
  )
}
