import { cookieStorage, createStorage, http } from '@wagmi/core'
import { createConfig } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { arbitrum as arbitrumChain, mainnet as mainnetChain } from 'wagmi/chains'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const chains = [arbitrumChain, mainnetChain] as const

export const networks = [mainnet, arbitrum]

export const newWagmiConfig = createConfig({
  chains,
  transports: {
    [mainnetChain.id]: http(),
    [arbitrumChain.id]: http()
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
})

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

// NOTE: this `newWagmiConfig` replaces the `wagmiConfig` from AppKit
// wagmiAdapter.wagmiConfig = newWagmiConfig
console.log('wagmiAdapter.wagmiConfig', wagmiAdapter.wagmiConfig)

export const config = wagmiAdapter.wagmiConfig
