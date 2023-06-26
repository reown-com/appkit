import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import {
  arbitrum,
  avalanche,
  bsc,
  evmos,
  fantom,
  gnosis,
  iotex,
  mainnet,
  metis,
  optimism,
  polygon,
  zkSync
} from 'wagmi/chains'
import WagmiWeb3ModalWidget from '../../components/WagmiWeb3ModalWidget'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

// Configure wagmi and web3modal
const projectId = getProjectId()
const chains = [
  mainnet,
  avalanche,
  gnosis,
  arbitrum,
  polygon,
  bsc,
  fantom,
  zkSync,
  optimism,
  evmos,
  iotex,
  metis
]
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

// Example
export default function WithWagmiReactPage() {
  return (
    <>
      <WagmiConfig config={wagmiClient}>
        <WagmiWeb3ModalWidget />
      </WagmiConfig>

      <Web3Modal ethereumClient={ethereumClient} projectId={projectId} themeMode={getTheme()} />
    </>
  )
}
