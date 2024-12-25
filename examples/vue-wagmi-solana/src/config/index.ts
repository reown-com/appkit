import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, polygon, base, solana, solanaTestnet, solanaDevnet, type AppKitNetwork } from '@reown/appkit/networks'
import { PhantomWalletAdapter,SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon, base, solana, solanaTestnet, solanaDevnet]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})