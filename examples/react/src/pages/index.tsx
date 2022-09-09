import { AccountButton, ConnectButton, useAccount, useSwitchChain } from '@web3modal/react'

export default function HomePage() {
  const { chainId, connected, address, connector, chainSupported } = useAccount()
  const { isLoading, switchChain } = useSwitchChain()

  function onSwithChainDemo(chain: string) {
    switchChain(chain)
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

      <select onChange={({ target }) => onSwithChainDemo(target.value)} disabled={isLoading}>
        <option value="eip155:1">Ethereum</option>
        <option value="eip155:42161">Arbitrum</option>
        <option value="eip155:43114">Avalanche</option>
      </select>
    </>
  ) : (
    <ConnectButton />
  )
}
