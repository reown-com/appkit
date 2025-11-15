import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { TonAdapter } from '@reown/appkit-adapter-ton'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  AppKitNetwork,
  arbitrum,
  bitcoin,
  bitcoinTestnet,
  mainnet,
  optimism,
  polygon,
  solana,
  solanaDevnet,
  solanaTestnet,
  ton,
  tonTestnet
} from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

export const networks = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  solana,
  solanaDevnet,
  solanaTestnet,
  bitcoin,
  bitcoinTestnet,
  ton,
  tonTestnet
] as [AppKitNetwork, ...AppKitNetwork[]]

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// Setup solana adapter
export const solanaAdapter = new SolanaAdapter()

// Setup bitcoin adapter
export const bitcoinAdapter = new BitcoinAdapter()

// Setup ton adapter
export const tonAdapter = new TonAdapter()

// Create modal
const initializeAppKit = async () => {
  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter, tonAdapter],
    networks,
    metadata: {
      name: 'AppKit Headless Example',
      description: 'AppKit Example with custom connect user interface.',
      url: 'https://appkit-headless.vercel.app',
      icons: ['https://appkit-headless.vercel.app/favicon-dark.png']
    },
    projectId,
    themeMode: 'light',
    features: {
      analytics: true
    },
    enableHeadless: true
  })
}

export { initializeAppKit }
