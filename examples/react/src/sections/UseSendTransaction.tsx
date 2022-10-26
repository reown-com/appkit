import { useSendTransaction, useWaitForTransaction } from '@web3modal/react'

export default function UseSendTransaction() {
  const transaction: { to: string; amountInLamports: number; feePayer: 'from' } = {
    to: '5fx8f8Fd6nD4gdXojFhgP58NiHtV6nPVeA85KjhnYdGC',
    amountInLamports: 200000,
    feePayer: 'from'
  }

  const { data, error, isLoading, sendTransaction } = useSendTransaction(transaction)
  const { receipt, isWaiting } = useWaitForTransaction({ hash: data?.hash })

  return (
    <section>
      <h1>useSendTransaction / useWaitForTransaction</h1>
      <p>Note: This example uses solana mainnet </p>
      <ul>
        <li>
          Request: <span>{JSON.stringify(transaction)}</span>
        </li>
        <li>
          Send Data: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Receipt Data: <span>{isWaiting ? 'Waiting...' : JSON.stringify(receipt)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => sendTransaction()}>Send Transaction</button>
    </section>
  )
}
