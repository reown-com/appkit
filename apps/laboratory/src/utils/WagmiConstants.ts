import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
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
  sepolia,
  optimismSepolia,
  type Chain
} from 'wagmi/chains'
import { ConstantsUtil } from './ConstantsUtil'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

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
    optimismSepolia
  ] as [Chain, ...Chain[]]
}

export const CONFIGS = {
  default: defaultWagmiConfig({
    chains: WagmiConstantsUtil.chains,
    projectId: ConstantsUtil.ProjectId,
    metadata: ConstantsUtil.Metadata,
    ssr: true
  }),
  email: defaultWagmiConfig({
    chains: WagmiConstantsUtil.chains,
    projectId: ConstantsUtil.ProjectId,
    metadata: ConstantsUtil.Metadata,
    enableEmail: true,
    auth: {
      socials: ['google', 'x', 'discord', 'apple', 'github']
    },
    ssr: true
  })
}
