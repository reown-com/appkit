import { mainnet, polygon, base } from '@reown/appkit/networks'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks = [mainnet, polygon, base]

export const ethers5Adapter = new Ethers5Adapter()
