import { AccountButton, ConnectButton, useAccount, useSwitchChain } from '@web3modal/react'

export default function HomePage() {
  const { chainId, connected, address, connector, chainSupported } = useAccount()
  const { isLoading, switchChain } = useSwitchChain()

  function onSwithChainDemo() {
    switchChain(chainId === 'eip155:1' ? 'eip155:43114' : 'eip155:1')
  }

  return connected ? (
    <>
      <AccountButton />
      <ul>
        <li>
          ChainID: <span>{chainId}</span>
        </li>
        <li>
          Chain Supported: <span>{chainSupported ? 'Yes' : 'No'}</span>
        </li>
        <li>
          Address: <span>{address}</span>
        </li>
        <li>
          Connector: <span>{connector}</span>
        </li>
      </ul>

      <button onClick={onSwithChainDemo} disabled={isLoading}>
        Switch to {chainId === 'eip155:1' ? 'Avalanche' : 'Ethereum'}
      </button>
    </>
  ) : (
    <ConnectButton />
  )
}
