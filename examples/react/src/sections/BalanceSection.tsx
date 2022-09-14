import { useAccount, useBalance } from '@web3modal/react'

export default function BalanceSection() {
  const { balance, refetch, isLoading } = useBalance()
  const account = useAccount()

  function onFetchBalance() {
    refetch({ addressOrName: account.address, chainId: account.chainId, formatUnits: 'wei' })
  }

  return (
    <section>
      <h1>Balance</h1>
      <button type="button" disabled={isLoading} onClick={onFetchBalance}>
        Get Balance
      </button>
      {balance ? <p>{balance}</p> : null}
    </section>
  )
}
