import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import WagmiWeb3ModalWidget from '../../components/WagmiWeb3ModalWidget'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

// Configure wagmi and web3modal
const projectId = getProjectId()
const chains = [mainnet, polygon]
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ projectId, chains }),
    new CoinbaseWalletConnector({ chains, options: { appName: 'Web3Modal' } })
  ],
  publicClient
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

// Example
export default function WithWagmiReactThemedPage() {
  return (
    <>
      <WagmiConfig config={wagmiClient}>
        <WagmiWeb3ModalWidget />
      </WagmiConfig>

      <Web3Modal
        themeMode={getTheme()}
        themeVariables={{
          '--w3m-accent-color': '#FF8700',
          '--w3m-accent-fill-color': '#000000',
          '--w3m-background-color': '#000000',
          '--w3m-background-image-url': '/images/customisation/background.png',
          '--w3m-logo-image-url': '/images/customisation/logo.png',
          '--w3m-background-border-radius': '0px',
          '--w3m-container-border-radius': '0px',
          '--w3m-wallet-icon-border-radius': '0px',
          '--w3m-wallet-icon-large-border-radius': '0px',
          '--w3m-input-border-radius': '0px',
          '--w3m-button-border-radius': '0px',
          '--w3m-secondary-button-border-radius': '0px',
          '--w3m-notification-border-radius': '0px',
          '--w3m-icon-button-border-radius': '0px',
          '--w3m-button-hover-highlight-border-radius': '0px',
          '--w3m-font-family': 'monospace'
        }}
        ethereumClient={ethereumClient}
        projectId={projectId}
        walletImages={{
          oreid: '/images/wallet_oreid.svg',
          coinbaseWallet:
            'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0'
        }}
        mobileWallets={[
          {
            id: 'oreid',
            name: 'OREID',
            links: {
              native: '',
              universal: 'https://www.oreid.io/'
            }
          }
        ]}
        desktopWallets={[
          {
            id: 'oreid',
            name: 'OREID',
            links: {
              native: '',
              universal: 'https://www.oreid.io/'
            }
          }
        ]}
        tokenContracts={{
          1: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
        }}
        tokenImages={{
          UNI: 'https://images.ctfassets.net/v44fuld738we/3Dj6wy5JChiZYfx598gIAN/fedbab0cc0a1887abc18e9fd9c05f286/uniswap.png?w=384&h=384&q=90&fm=png&bg=transparent'
        }}
      />
    </>
  )
}
