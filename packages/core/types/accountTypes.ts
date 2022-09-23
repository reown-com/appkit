import type { Connector } from '@web3modal/ethereum'

export interface Account {
  address?: string
  isConnected: boolean
  connector?: Connector
}
