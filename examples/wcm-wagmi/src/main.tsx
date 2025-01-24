import React from 'react'
import ReactDOM from 'react-dom/client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

import App from './app.jsx'
import './assets/main.css'
import { customWalletConnectConnector } from './connectors/wallet-connect-connector.js'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
  connectors: [customWalletConnectConnector]
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <App />
    </WagmiProvider>
  </React.StrictMode>
)
