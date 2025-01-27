import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { AppKitNetwork, arbitrum, mainnet, optimism, polygon } from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo
} from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [mainnet, polygon, arbitrum, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

// Setup wagmi adapter
export const ethersAdapter = new EthersAdapter()

// Create modal
const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js Ethers',
    description: 'AppKit Next.js App Router with Ethers Adapter',
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
