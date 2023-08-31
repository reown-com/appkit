import { ChakraProvider } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import {
  arbitrum,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora
} from 'wagmi/chains'
import Layout from '../layout'
import { bootstrapSentry } from '../utils/SentryUtil'

bootstrapSentry()

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora
]
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create Web3Modal
export const modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  tokens: { 1: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } }
})

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <ChakraProvider>
      <Layout>
        {ready && (
          <WagmiConfig config={wagmiConfig}>
            <Component {...pageProps} />
          </WagmiConfig>
        )}
      </Layout>
    </ChakraProvider>
  )
}
