import { useAppKitTheme, wagmiAdapter } from './config'

import ActionButtonList from './components/ActionButton'
import InfoList from './components/InfoList'
import Footer from './components/Footer'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  const { themeMode } = useAppKitTheme()
  document.documentElement.className = themeMode

  return (
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
}
