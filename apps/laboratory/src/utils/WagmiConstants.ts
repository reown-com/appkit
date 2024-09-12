import { defaultWagmiConfig } from '@web3modal/wagmi/react'
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
  baseSepolia,
  type Chain
} from 'wagmi/chains'
import { ConstantsUtil } from './ConstantsUtil'
import type { SocialProvider } from '@web3modal/base'

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

export function getWagmiConfig(type: 'default' | 'email', override = {}) {
  const config = {
    chains: WagmiConstantsUtil.chains,
    projectId: ConstantsUtil.ProjectId,
    metadata: ConstantsUtil.Metadata,
    ssr: true,
    ...override,
    auth: {
      email: false,
      socials: [] as SocialProvider[]
    }
  }

  const emailConfig = {
    ...config,
    auth: {
      socials: [
        'google',
        'x',
        'discord',
        'farcaster',
        'github',
        'apple',
        'facebook'
      ] as SocialProvider[]
    }
  }

  const wagmiConfig = defaultWagmiConfig(type === 'email' ? emailConfig : config)

  return wagmiConfig
}
