import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { type AppKitNetwork, berachainTestnet } from '@reown/appkit/networks'
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

export const projectId = import.meta.env.VITE_PROJECT_ID

const networks = [berachainTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

// Setup solana adapter
const ethers5Adapter = new Ethers5Adapter()

// Create modal
const modal = createAppKit({
  adapters: [ethers5Adapter],
  networks,
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Ethers v5 Example',
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
