import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
  type AppKitNetwork
} from '@reown/appkit/networks'

export const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, arbitrum, avalanche, base, optimism, polygon] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  networks,
  projectId
})

export const config = wagmiAdapter.wagmiConfig
