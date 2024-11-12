import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import {
  PhantomWalletAdapter,
  HuobiWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

const networks = [solana, solanaTestnet, solanaDevnet]

// 3. Create modal
createAppKit({
  adapters: [
    new SolanaAdapter({
      wallets: [
        new HuobiWalletAdapter(),
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new TrustWalletAdapter()
      ]
    })
  ],
  networks,
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Example',
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
    <>
      <appkit-button />
      <appkit-network-button />
      <appkit-connect-button />
      <appkit-account-button />

      <button onClick={() => modal.open()}>Connect Wallet</button>
      <button onClick={() => modal.open({ view: 'Networks' })}>Choose Network</button>
      <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
        Toggle Theme Mode
      </button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </>
  )
}
