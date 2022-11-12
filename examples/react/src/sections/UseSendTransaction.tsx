import { BigNumber } from 'ethers'
import { usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'

export default function UseSendTransaction() {
  const transaction = {
    request: {
      to: '0x000000000000000000000000000000000000dead',
      value: BigNumber.from('10000000000000000')
    }
  }

  const { config } = usePrepareSendTransaction(transaction)
  const { data, error, isLoading, sendTransaction } = useSendTransaction(config)
  const { data: waitData, isLoading: waitLoading } = useWaitForTransaction({ hash: data?.hash })

  function onSend() {
    sendTransaction?.()
  }

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
          Receipt Data: <span>{waitLoading ? 'Waiting...' : JSON.stringify(waitData)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onSend}>Send Transaction</button>
    </section>
  )
}
