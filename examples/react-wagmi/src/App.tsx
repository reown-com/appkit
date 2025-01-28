import { createAppKit } from '@reown/appkit-basic'
import {
  type AppKitNetwork,
  arbitrum,
  mainnet,
  optimism,
  polygon
} from '@reown/appkit-basic/networks'

export const projectId = 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [mainnet, polygon, arbitrum, optimism] as unknown as unknown as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

// Create modal
createAppKit({
  adapters: [],
  networks,
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Wagmi Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  basic: true,
  themeMode: 'light',
  features: {
    analytics: true
  }
})
export default function App() {
  return null
}
