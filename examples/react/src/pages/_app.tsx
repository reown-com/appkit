import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, avalanche, bsc, fantom, mainnet, optimism, polygon } from 'wagmi/chains'
import Navigation from '../components/Navigation'
import '../styles.css'

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// 2. Configure wagmi client
const chains = [mainnet, polygon, optimism, arbitrum, avalanche, fantom, bsc]
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    appName: 'web3Modal',
    chains
  }),
  provider
})

// 3. Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiClient, chains)

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <WagmiConfig client={wagmiClient}>
          <Navigation />
          <Component {...pageProps} />
        </WagmiConfig>
      ) : null}

      {/* Add Web3Modal here, This example adds them in individual pages */}
      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
    </>
  )
}
