import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Button, Web3Modal, Web3NetworkSwitch } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import { getProjectId } from '../utilities/EnvUtil'

// Configure wagmi and web3modal
const projectId = getProjectId()
const chains = [mainnet, polygon]
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ version: '1', projectId, appName: 'web3Modal', chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

// Example
export default function v1BasePage() {
  return (
    <>
      <WagmiConfig client={wagmiClient}></WagmiConfig>
      <Web3Button balance="show" />
      <Web3NetworkSwitch />
      <Web3Modal ethereumClient={ethereumClient} projectId={projectId} />
    </>
  )
}
