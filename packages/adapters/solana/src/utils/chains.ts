import { type CaipNetwork } from '@reown/appkit-common'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet
} as Record<`${string}:${string}`, CaipNetwork>
