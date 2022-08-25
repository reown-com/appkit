import { Web3ModalEthereum } from '@web3modal/ethereum'
import { Web3ModalProvider } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'

const WC_PROJECT_ID = 'd28ea8bc8db643d07038d99ddce49e4a'

// Configure chains and providers (rpc's)
const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet],
  [Web3ModalEthereum.getWalletConnectProvider({ projectId: WC_PROJECT_ID })]
)

// Create wagmi client
const wagmiClient = createClient({
  connectors: Web3ModalEthereum.getDefaultConnectors({ chains, appName: 'web3Modal react' }),
  provider,
  webSocketProvider
})

// Create web3modal ethereum client for wagmi
const ethereumClient = Web3ModalEthereum.createClient(wagmiClient)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider
      config={{
        projectId: WC_PROJECT_ID,
        theme: 'dark',
        accentColor: 'orange',
        ethereumClient
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>
    </Web3ModalProvider>
  )
}
