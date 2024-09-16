import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks'

export const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const caipNetworks = [mainnet, arbitrum, avalanche, base, optimism, polygon]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  caipNetworks,
  projectId
})

export const config = wagmiAdapter.wagmiConfig
