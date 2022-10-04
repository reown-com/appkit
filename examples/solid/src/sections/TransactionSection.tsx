import { useAccount, useSendTransaction } from '@web3modal/solid'
import { createSignal } from 'solid-js'

export function TransactionSection() {
  const { chainId, address } = useAccount()

  const { transaction, refetch } = useSendTransaction()
  const [to, setTo] = createSignal('')

  return (
    <section>
      <h1>Send Transaction</h1>
      <label>0x</label>
      <input value={to()} onChange={({ currentTarget }) => setTo(currentTarget.value)} />
      <button
        onClick={() => {
          refetch({
            chainId,
            request: {
              gasLimit: 100000,
              value: 1,
              from: address,
              to: `0x${to()}`
            }
          })
        }}
      >
        Send Transaction
      </button>
      <p>{JSON.stringify(transaction()?.hash)}</p>
    </section>
  )
}
