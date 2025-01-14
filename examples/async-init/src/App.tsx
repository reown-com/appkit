import ActionButtonList from './components/ActionButton'
import InfoList from './components/InfoList'
import Footer from './components/Footer'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { mainnet, polygon, type AppKitNetwork } from '@reown/appkit/networks'
import { createAppKitAsync } from './config'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const queryClient = new QueryClient()

export default function App() {
  const [wagmiAdapter, setWagmiAdapter] = useState<WagmiAdapter>()
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>()

  const getNetworks = async (): Promise<[AppKitNetwork, ...AppKitNetwork[]]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([mainnet, polygon])
      }, 1000)
    })
  }

  const initialize = async () => {
    const networks = await getNetworks()
    const { wagmiAdapter, modal } = await createAppKitAsync(networks)
    const theme = modal.getThemeMode()
    document.documentElement.className = theme
    setThemeMode(theme)
    setWagmiAdapter(wagmiAdapter)
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    wagmiAdapter && (
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <div className="page-container">
            <div className="logo-container">
              <img
                src={themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'}
                alt="Reown"
                width="150"
              />
              <img src="/appkit-logo.png" alt="Reown" width="150" />
            </div>

            <h1 className="page-title">React Wagmi Example</h1>

            <div className="appkit-buttons-container">
              <appkit-button />
              <appkit-network-button />
            </div>

            <ActionButtonList />
            <InfoList />
            <Footer />
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    )
  )
}
