import { type CaipNetwork } from '@reown/appkit-common'
import { eclipse, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet,
  'solana:eclipse-mainnet': eclipse
} as Record<`${string}:${string}`, CaipNetwork>
