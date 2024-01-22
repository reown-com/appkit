import {
  arbitrum,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora,
  sepolia
} from 'viem/chains'
import type { Chain } from 'viem/chains'

export const WagmiConstantsUtil = {
  chains: [
    mainnet,
    arbitrum,
    polygon,
    avalanche,
    bsc,
    optimism,
    gnosis,
    zkSync,
    zora,
    base,
    celo,
    aurora,
    sepolia
  ] as Chain[]
}
