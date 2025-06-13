import React from 'react'
import ReactDOM from 'react-dom/client'

import { ReownAuthentication } from '@reown/appkit-siwx'
import { mainnet, solana } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import App from './App.jsx'
import './assets/main.css'
import { SessionProvider } from './components/SessionProvider.jsx'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

// Create modal
createAppKit({
  networks: [mainnet, solana],
  metadata: {
    name: 'AppKit React Reown Authentication Example',
    description: 'AppKit React Reown Authentication Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light',
  siwx: new ReownAuthentication()
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
)
