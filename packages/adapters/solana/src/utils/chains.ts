import { type CaipNetwork, type CaipNetworkId } from '@laughingwhales/appkit-common'
import { solana, solanaDevnet, solanaTestnet } from '@laughingwhales/appkit/networks'

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet
} as Record<`${string}:${string}`, CaipNetwork>

export function getStandardChain(
  caipNetworkId: CaipNetworkId
): keyof typeof solanaChains | undefined {
  const standardChain = Object.entries(solanaChains).find(
    ([_, chain]) => chain.caipNetworkId === caipNetworkId
  )

  return standardChain?.[0] as keyof typeof solanaChains | undefined
}
