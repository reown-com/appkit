import { useSendTransaction, useWaitForTransaction } from '@web3modal/react'
import { BigNumber } from 'ethers'

export default function UseSendTransaction() {
  const transaction = {
    request: {
      to: '0x000000000000000000000000000000000000dead',
      value: BigNumber.from('10000000000000000')
    }
  }

  const { data, error, isLoading, sendTransaction } = useSendTransaction(transaction)
  const { receipt, isWaiting } = useWaitForTransaction({ hash: data?.hash })

  return (
    <section>
      <h1>useSendTransaction / useWaitForTransaction</h1>

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
