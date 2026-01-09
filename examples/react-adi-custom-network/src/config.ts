import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum, mainnet, optimism, polygon, type AppKitNetwork } from '@reown/appkit/networks'
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

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

// Define ADI Chain as a custom network
export const adiChain: AppKitNetwork = {
  id: 36900,
  name: 'ADI_Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI'
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.adifoundation.ai']
    }
  },
  blockExplorers: {
    default: {
      name: 'ADI Explorer',
      url: 'https://explorer.adifoundation.ai'
    }
  },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:36900',
  testnet: false
}

// Include ADI chain alongside mainnet networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [adiChain, mainnet, polygon, arbitrum, optimism]

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
    name: 'ADI Chain Example',
    description: 'AppKit Example with ADI Chain Custom Network',
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
