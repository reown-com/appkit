import { Web3ModalEthereum } from '@web3modal/ethereum'
import type { ConfigOptions } from '@web3modal/react'
import { Web3ModalProvider } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import '../styles.css'

const WC_PROJECT_ID = '6a8d17fb-6d30-4450-9ed8-3cbb2771483a'

// Configure chains and providers (rpc's)
const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet],
  [Web3ModalEthereum.walletConnectRpc({ projectId: WC_PROJECT_ID })]
)

// Create wagmi client
const wagmiClient = createClient({
  connectors: Web3ModalEthereum.defaultConnectors({ chains, appName: 'web3Modal' }),
  provider,
  webSocketProvider
})

// Configure web3modal
const modalConfig: ConfigOptions = {
  projectId: WC_PROJECT_ID,
  theme: 'dark',
  accentColor: 'green'
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider config={modalConfig} ethereumClient={wagmiClient}>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>
    </Web3ModalProvider>
  )
}
