import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit'
import type { AppKitNetwork } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const createAppKitAsync = async (chains: [AppKitNetwork, ...AppKitNetwork[]]) => {
  const wagmiAdapter = new WagmiAdapter({
    networks: chains,
    projectId
  })

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: chains,
    metadata: {
      name: 'AppKit React Example',
      description: 'AppKit React Wagmi Example',
      url: 'https://reown.com/appkit',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    },
    projectId,
    themeMode: 'light',
    features: {
      analytics: true
    }
  })

  return { modal, wagmiAdapter }
}
