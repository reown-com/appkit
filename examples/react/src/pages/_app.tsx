import { chain, configureChains, createClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { Web3ModalEthereum } from '@web3modal/ethereum'
import type { ConfigOptions } from '@web3modal/react'
import { Web3ModalProvider } from '@web3modal/react'
import type { AppProps } from 'next/app'
import '../styles.css'

// Get projectID at https://cloud.walletconnect.com
const WC_PROJECT_ID = 'YOUR_PROJECT_ID'

// Configure chains and providers (rpc's)
const { chains, provider } = configureChains([chain.mainnet], [publicProvider()])

// Create wagmi client
const wagmiClient = createClient({
  autoConnect: true,
  connectors: Web3ModalEthereum.defaultConnectors({ chains, appName: 'web3Modal' }),
  provider
})

// Configure web3modal
const modalConfig: ConfigOptions = {
  projectId: WC_PROJECT_ID,
  theme: 'dark',
  accentColor: 'orange'
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider config={modalConfig} ethereumClient={wagmiClient}>
      <Component {...pageProps} />
    </Web3ModalProvider>
  )
}
