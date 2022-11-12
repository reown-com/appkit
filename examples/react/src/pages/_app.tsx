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

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

const chains = [
  modalChains.mainnet,
  modalChains.polygon,
  modalChains.avalanche,
  modalChains.fantom,
  modalChains.optimism,
  modalChains.arbitrum,
  modalChains.binanceSmartChain
]

const { provider } = configureChains(chains, [modalProviders.walletConnectProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Moda', chains }),
  provider
})

const ethereumClient = Web3ModalEthereum.create(wagmiClient, chains)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        theme="dark"
        accentColor="default"
        ethereumClient={ethereumClient}
      />
    </>
  )
}
