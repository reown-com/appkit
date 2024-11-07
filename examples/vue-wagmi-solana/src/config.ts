import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, base } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, base],
  projectId
})
