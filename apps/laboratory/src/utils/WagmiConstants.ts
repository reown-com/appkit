import {
  type Chain,
  arbitrum,
  aurora,
  avalanche,
  base,
  baseSepolia,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  sepolia,
  zkSync,
  zora
} from 'wagmi/chains'

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
    sepolia,
    optimismSepolia,
    baseSepolia
  ] as [Chain, ...Chain[]]
}
