import { Web3ModalEthereum } from '@web3modal/ethereum'
import { Web3ModalProvider } from '@web3modal/react'
import { AppProps } from 'next/app'
import Wagmi from 'wagmi'

const WC_PROJECT_ID = 'd28ea8bc8db643d07038d99ddce49e4a'

// Configure chains and providers (rpc's)
const { chains, provider, webSocketProvider } = Wagmi.configureChains(
  [Wagmi.chain.mainnet],
  [Web3ModalEthereum.getWalletConnectProvider({ projectId: WC_PROJECT_ID })]
)

// Create wagmi client
const wagmiClient = Wagmi.createClient({
  connectors: Web3ModalEthereum.getDefaultConnectors({ chains, appName: 'web3Modal react' }),
  provider,
  webSocketProvider
})

// Create web3modal ethereum client for wagmi
const ethereumClient = Web3ModalEthereum.createClient(wagmiClient)

// Create web3modal config
const web3ModalConfig = {
  projectId: WC_PROJECT_ID,
  theme: 'dark',
  accentColor: 'orange',
  ethereumClient
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider config={web3ModalConfig}>
      <Component {...pageProps} />
    </Web3ModalProvider>
  )
}
