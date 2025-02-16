import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  base,
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaDevnet
} from '@reown/appkit/networks'

export const networks = [mainnet, polygon, base, solana, solanaDevnet, bitcoin, bitcoinTestnet]

export const projectId = 'b56e18d47c72ab683b10814fe9495694'

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

export const solanaAdapter = new SolanaAdapter()

export const bitcoinAdapter = new BitcoinAdapter()
