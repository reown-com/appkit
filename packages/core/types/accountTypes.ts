import type { Connector } from '@web3modal/ethereum'

export interface AccountCtrlState {
  address?: string
  isConnected: boolean
  connector?: Connector
}
