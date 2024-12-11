import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, base } from '@reown/appkit/networks'

const config = useRuntimeConfig()
export const projectId = config.public.projectId

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, base],
  projectId
})
