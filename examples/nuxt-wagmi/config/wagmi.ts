import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, base } from '@reown/appkit/networks'

export const networks = [mainnet, polygon, base]

export const projectId = 'b56e18d47c72ab683b10814fe9495694'

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})
