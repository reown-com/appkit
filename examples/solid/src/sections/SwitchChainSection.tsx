import { useSwitchNetwork } from '@web3modal/solid'

export default function AccountSection() {
  const { isLoading, switchChain } = useSwitchNetwork()

  function onSwithChainDemo(chain: string) {
    switchChain(chain)
  }

  return (
    <section>
      <h1>Switch Network</h1>
      <select
        onChange={({ currentTarget }) => onSwithChainDemo(currentTarget.value)}
        disabled={isLoading()}
      >
        <option value="eip155:1">Ethereum</option>
        <option value="eip155:42161">Arbitrum</option>
      </select>
    </section>
  )
}
