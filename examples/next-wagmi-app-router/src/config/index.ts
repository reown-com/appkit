import {
  createAppKit,
  useAppKit,
  useAppKitState,
  useAppKitAccount,
  useAppKitTheme,
  useAppKitEvents,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, arbitrum, optimism, AppKitNetwork } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [mainnet, polygon, arbitrum, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// Create modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js Wagmi',
    description: 'AppKit Next.js App Router with Wagmi Adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  }
})

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}
