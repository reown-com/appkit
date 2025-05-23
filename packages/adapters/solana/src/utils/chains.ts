import { type CaipNetwork } from '@reown/appkit-common'
import {
  eclipse,
  eclipseDevnet,
  eclipseTestnet,
  solana,
  solanaDevnet,
  solanaTestnet
} from '@reown/appkit/networks'

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet,
  'eclipse:mainnet': eclipse,
  'eclipse:testnet': eclipseTestnet,
  'eclipse:devnet': eclipseDevnet
} as Record<`${string}:${string}`, CaipNetwork>
