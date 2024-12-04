import { Transport } from 'viem'
import { mainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'

const supportedChains = [mainnet] as const

export type ChainId = (typeof supportedChains)[number]['id']

const transports = supportedChains.reduce(
  (acc, chain) => {
    acc[chain.id] = http()

    return acc
  },
  {} as Record<ChainId, Transport>
)

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports
})
