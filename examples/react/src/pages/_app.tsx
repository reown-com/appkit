import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import '../styles.css'

// Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID)
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
const chains = [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum]

const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Moda', chains }),
  provider
})

const ethereumClient = new EthereumClient(wagmiClient, chains)

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
