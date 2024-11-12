import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/react'
import { mainnet, polygon, bsc } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiHooks } from './WagmiHooks'

// 0. Setup queryClient for WAGMIv2
const queryClient = new QueryClient()

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Setup wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, polygon, bsc]
})

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon],
  metadata: {
    name: 'AppKit',
    description: 'AppKit React Wagmi Example',
    url: '',
    icons: []
  },
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 20
  }
})

export default function App() {
  // 4. Use modal hook
  const modal = useAppKit()
  const state = useAppKitState()
  const { themeMode, themeVariables, setThemeMode } = useAppKitTheme()
  const events = useAppKitEvents()

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <appkit-button />
        <appkit-network-button />
        <appkit-connect-button />
        <appkit-account-button />

        <button onClick={() => modal.open()}>Connect Wallet</button>
        <button onClick={() => modal.open({ view: 'Networks' })}>Choose Network</button>
        <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
          Toggle Theme Mode
        </button>
        <WagmiHooks />
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre>
        <pre>{JSON.stringify(events, null, 2)}</pre>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
