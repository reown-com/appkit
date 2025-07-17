import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  type AppKitNetwork,
  base,
  mainnet,
  polygon,
  solana,
  solanaDevnet
} from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/vue'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  polygon,
  base,
  solana,
  solanaDevnet
]

export const solanaWeb3JsAdapter = new SolanaAdapter()

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Initialize AppKit
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks,
  projectId,
  themeMode: 'light',
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})
