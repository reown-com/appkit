import { browser } from '$app/environment'

import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum, mainnet, optimism, polygon } from '@reown/appkit/networks'

// Only initialize in browser environment
let modal: ReturnType<typeof createAppKit> | undefined = undefined

if (browser) {
  const projectId = import.meta.env.VITE_PROJECT_ID
  if (!projectId) {
    throw new Error('VITE_PROJECT_ID is not set')
  }

  const networks = [arbitrum, mainnet, optimism, polygon]

  // Create adapter
  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId
  })

  // Initialize AppKit
  modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [arbitrum, mainnet, optimism, polygon],
    defaultNetwork: arbitrum,
    projectId,
    themeMode: 'light',
    features: {
      email: false,
      socials: false
    },
    metadata: {
      name: 'SvelteKit Example',
      description: 'SvelteKit Example using Wagmi adapter',
      url: 'https://reown.com/appkit',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    }
  })
}

export { modal }
