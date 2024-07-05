import { defaultWagmiConfig } from '@web3modal/solana/react/config'
import {
  createWeb3Modal,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalState,
  useWeb3ModalTheme
} from '@web3modal/solana/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient for WAGMIv2
const queryClient = new QueryClient()

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const wagmiConfig = defaultWagmiConfig({
  chains: [
    {
      chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      name: 'Solana',
      currency: 'SOL',
      explorerUrl: 'https://solscan.io',
      rpcUrl: 'https://rpc.walletconnect.org/v1'
    },
    {
      chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
      name: 'Solana Testnet',
      currency: 'SOL',
      explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
      rpcUrl: 'https://api.testnet.solana.com'
    },
    {
      chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      name: 'Solana Devnet',
      currency: 'SOL',
      explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
      rpcUrl: 'https://api.devnet.solana.com'
    }
  ],
  projectId,
  metadata: {
    name: 'Web3Modal React Example',
    description: 'Web3Modal React Example',
    url: '',
    icons: []
  }
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 20
  }
})

export default function App() {
  // 4. Use modal hook
  const modal = useWeb3Modal()
  const state = useWeb3ModalState()
  const { themeMode, themeVariables, setThemeMode } = useWeb3ModalTheme()
  const events = useWeb3ModalEvents()

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <w3m-button />
        <w3m-network-button />
        <w3m-connect-button />
        <w3m-account-button />

        <button onClick={() => modal.open()}>Connect Wallet</button>
        <button onClick={() => modal.open({ view: 'Networks' })}>Choose Network</button>
        <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
          Toggle Theme Mode
        </button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre>
        <pre>{JSON.stringify(events, null, 2)}</pre>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
