import { type CaipNetwork } from '@reown/appkit-common'
import { solana, solanaDevnet, solanaTestnet, eclipseDevnet } from '@reown/appkit/networks'

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet,
  'solana:eclipse-devnet': eclipseDevnet
} as Record<`${string}:${string}`, CaipNetwork>
