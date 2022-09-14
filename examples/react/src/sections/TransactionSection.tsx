import { useAccount } from '@web3modal/react'
import { useSendTransaction } from '@web3modal/react'
import { useState } from 'react'

export function TransactionSection() {
  const { chainId, address } = useAccount()

  const { transaction, refetch } = useSendTransaction()
  const [to, setTo] = useState('')

  return (
    <section>
      <h1>Send Transaction</h1>
      <label>0x</label>
      <input value={to} onChange={({ target }) => setTo(target.value)} />
      <button
        onClick={() => {
          refetch({
            chainId,
            request: {
              gasLimit: 100000,
              value: 1,
              from: address,
              to: `0x${to}`
            }
          })
        }}
      >
        Send Transaction
      </button>
      <p>{JSON.stringify(transaction?.hash)}</p>
    </section>
  )
}
