import React from 'react'
import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, createConnector, http } from 'wagmi'
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

import App from './app.jsx'
import './assets/main.css'
import { ConstantsUtil } from './utils/ConstantsUtil'

export const chains = [mainnet, polygon, arbitrum, optimism] as const

const config = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http()
  },
  connectors: [
    // With QR Modal
    walletConnect(ConstantsUtil.WC_DEFAULT_PARAMS)
  ]
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
