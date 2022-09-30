import type { Chain, Connector, EthereumOptions, Web3ModalEthereum } from '@web3modal/ethereum'

// -- utils ------------------------------------------------ //
export type ValueType<T> = T extends Promise<infer U> ? U : T

// -- AccountCtrl ------------------------------------------ //
export interface AccountCtrlState {
  address?: string
  isConnected: boolean
  connector?: Connector
}

// -- BalanceCtrl ------------------------------------------ //
export type BalanceCtrlFetchArgs = Parameters<typeof Web3ModalEthereum.fetchBalance>[0]

export type BalanceCtrlFetchReturnValue = ValueType<
  ReturnType<typeof Web3ModalEthereum.fetchBalance>
>

// -- BlockCtrl -------------------------------------------- //
export type BlockCtrlWatchOptions = Omit<
  Parameters<typeof Web3ModalEthereum.watchBlockNumber>[0],
  'listen'
>

export type BlockCtrlWatchCallback = Parameters<typeof Web3ModalEthereum.watchBlockNumber>[1]

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
export type ProviderCtrlWatchOptions = Parameters<typeof Web3ModalEthereum.watchProvider>[0]

export type ProviderCtrlWatchCallback = Parameters<typeof Web3ModalEthereum.watchProvider>[1]

// -- WebSocketProviderCtrl -------------------------------- //
export type WebSocketProviderCtrlWatchOptions = Parameters<
  typeof Web3ModalEthereum.watchWebSocketProvider
>[0]

export type WebSocketProviderCtrlWatchCallback = Parameters<
  typeof Web3ModalEthereum.watchWebSocketProvider
>[1]

// -- SignerProviderCtrl ----------------------------------- //
export type SignerCtrlWatchOptions = Parameters<typeof Web3ModalEthereum.watchSigner>[0]

export type SignerCtrlWatchCallback = Parameters<typeof Web3ModalEthereum.watchSigner>[1]

export type SignerCtrlSignMessageArgs = Parameters<typeof Web3ModalEthereum.signMessage>[0]

export type SignerCtrlSignTypedDataArgs = Parameters<typeof Web3ModalEthereum.signTypedData>[0]

// -- FeeCtrl ---------------------------------------------- //
export type FeeCtrlFetchArgs = Parameters<typeof Web3ModalEthereum.fetchFeeData>[0]

export type FeeCtrlFetchReturnValue = ValueType<ReturnType<typeof Web3ModalEthereum.fetchFeeData>>

// -- EnsCtrl ---------------------------------------------- //
export type EnsCtrlFetchEnsAddressArgs = Parameters<typeof Web3ModalEthereum.fetchEnsAddress>[0]

export type EnsCtrlFetchEnsAvatarArgs = Parameters<typeof Web3ModalEthereum.fetchEnsAvatar>[0]

export type EnsCtrlFetchEnsNameArgs = Parameters<typeof Web3ModalEthereum.fetchEnsName>[0]

export type EnsCtrlFetchEnsResolverArgs = Parameters<typeof Web3ModalEthereum.fetchEnsResolver>[0]
