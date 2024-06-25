import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, type Chain } from 'wagmi/chains'
import { ConstantsUtil } from './ConstantsUtil'

export const WagmiConstantsUtil = {
  chains: [mainnet] as [Chain, ...Chain[]]
}

export function getWagmiConfig(type: 'default' | 'email') {
  const config = {
    chains: WagmiConstantsUtil.chains,
    projectId: ConstantsUtil.ProjectId,
    metadata: ConstantsUtil.Metadata,
    ssr: true
  }

  const emailConfig = {
    ...config,
    auth: {
      socials: ['google', 'x', 'discord', 'apple', 'github']
    }
  }

  const wagmiConfig = defaultWagmiConfig(type === 'email' ? emailConfig : config)

  return wagmiConfig
}
