import type {
  Chain,
  Connector,
  EthereumOptions,
  Provider,
  Web3ModalEthereum,
  WebSocketProvider
} from '@web3modal/ethereum'

// -- utils ------------------------------------------------ //
export type ValueType<T> = T extends Promise<infer U> ? U : T

// -- AccountCtrl ------------------------------------------ //
export interface AccountCtrlState {
  address?: string
  isConnected: boolean
  connector?: Connector
}

// -- BalanceCtrl ------------------------------------------ //
export type BalanceCtrlReturnValue = ValueType<ReturnType<typeof Web3ModalEthereum.fetchBalance>>

export type BalanceCtrlFetchArgs = Parameters<typeof Web3ModalEthereum.fetchBalance>[0]

// -- BlockCtrl -------------------------------------------- //
export interface BlockCtrlState {
  blockNumber: number
}

export type BlockCtrlFetchArgs = Parameters<typeof Web3ModalEthereum.fetchBlockNumber>[0]

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  initialized: boolean
  ethereum?: typeof Web3ModalEthereum
}

export type ClientCtrlSetEthereumClientArgs = EthereumOptions

// -- NetworkCtrl ------------------------------------------ //
export interface NetworkCtrlState {
  chain?: Chain & { unsuported?: boolean }
  chains: Chain[]
}

// -- ProviderCtrl ----------------------------------------- //
export type ProviderCtrlState = Provider

// -- WebSocketProviderCtrl -------------------------------- //
export type WebSocketProviderCtrlState = WebSocketProvider
