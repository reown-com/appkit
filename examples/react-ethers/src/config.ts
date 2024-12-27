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
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, polygon, arbitrum, optimism } from '@reown/appkit/networks'
import ActionButtonList from './components/ActionButton'
import InfoList from './components/InfoList'
import Footer from './components/Footer'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [mainnet, polygon, arbitrum, optimism]

// Setup solana adapter
const ethersAdapter = new EthersAdapter()

// Create modal
const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Ethers Example',
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