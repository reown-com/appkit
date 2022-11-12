import {
  modalChains,
  modalConnectors,
  modalProviders,
  Web3ModalEthereum
} from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import '../styles.css'

// Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID)
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

const { chains, provider } = configureChains(
  [modalChains.mainnet, modalChains.polygon],
  [modalProviders.walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_PROJECT_ID })]
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Moda', chains }),
  provider
})

const ethereumClient = Web3ModalEthereum.create(wagmiClient)

// Configure web3modal
const config = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  theme: 'dark' as const,
  accentColor: 'default' as const
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal config={config} ethereumClient={ethereumClient} />
    </>
  )
}
