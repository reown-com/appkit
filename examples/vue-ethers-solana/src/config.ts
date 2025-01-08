import { mainnet, polygon, base, solana, solanaTestnet } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks = [mainnet, polygon, base, solana, solanaTestnet]

export const ethersAdapter = new EthersAdapter()

export const solanaWeb3JsAdapter = new SolanaAdapter({})
