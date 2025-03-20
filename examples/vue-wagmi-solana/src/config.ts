import {
  HuobiWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'

import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, mainnet, polygon, solana, solanaDevnet } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks = [mainnet, polygon, base, solana, solanaDevnet]

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new HuobiWalletAdapter(),
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter()
  ]
})

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})
