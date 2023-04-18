import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import WagmiWeb3ModalWidget from '../components/WagmiWeb3ModalWidget'
import { getProjectId, getTheme } from '../utilities/EnvUtil'

// Configure wagmi and web3modal
const projectId = getProjectId()
const chains = [mainnet, polygon]
const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ version: 2, projectId, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

// Example
export default function v2BasePage() {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <WagmiWeb3ModalWidget />
      </WagmiConfig>

      <Web3Modal
        ethereumClient={ethereumClient}
        projectId={projectId}
        themeMode={getTheme()}
        explorerRecommendedWalletIds={[
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow Wallet
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0' // Trust Wallet
        ]}
      />
    </>
  )
}
