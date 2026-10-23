import { SolanaAdapter, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { type AppKitNetwork, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { createAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

// @ts-expect-error Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [solanaDevnet, solana, solanaTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

// Setup solana adapter
const solanaAdapter = new SolanaAdapter()

// Create modal
const modal = createAppKit({
  adapters: [solanaAdapter],
  networks,
  defaultNetwork: solanaDevnet,
  metadata: {
    name: 'AppKit Solana-Kit Example',
    description: 'AppKit React Solana-Kit Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  }
})

export { modal, useAppKitAccount, useAppKitProvider, useAppKitConnection }
