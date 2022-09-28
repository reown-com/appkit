import type { Chain } from '@web3modal/ethereum'

export interface NetworkCtrlState {
  chain?: Chain & { unsuported?: boolean }
  chains: Chain[]
}
