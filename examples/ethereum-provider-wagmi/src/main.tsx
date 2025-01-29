import React from 'react'
import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, createConnector, http } from 'wagmi'
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

import App from './app.jsx'
import './assets/main.css'
import { ConstantsUtil } from './utils/ConstantsUtil'

const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http()
  },
  connectors: [
    // With QR Modal
    walletConnect(ConstantsUtil.WC_DEFAULT_PARAMS),
    // Without QR Modal
    createConnector(config => ({
      ...walletConnect({ ...ConstantsUtil.WC_DEFAULT_PARAMS, showQrModal: false })(config),
      id: 'custom-wallet-connect',
      name: 'Custom WalletConnect'
    }))
  ]
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
