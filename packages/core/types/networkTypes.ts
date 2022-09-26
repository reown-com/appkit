import type { Chain } from '@web3modal/ethereum'

export interface Network {
  chain?: Chain & { unsuported?: boolean }
  chains: Chain[]
}
