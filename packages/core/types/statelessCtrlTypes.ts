import type { Web3ModalEthereum } from '@web3modal/ethereum'

// -- utils ------------------------------------------------ //
type EthApi = typeof Web3ModalEthereum
type ResolvePromiseReturn<T> = T extends Promise<infer U> ? U : T

// -- AccountCtrl ------------------------------------------ //
export type AccountCtrlWatchCallback = Parameters<EthApi['watchAccount']>[0]

export type AccountCtrlGetReturnValue = ReturnType<EthApi['getAccount']>

// -- BalanceCtrl ------------------------------------------ //
export type BalanceCtrlFetchArgs = Parameters<EthApi['fetchBalance']>[0]

export type BalanceCtrlFetchReturnValue = ResolvePromiseReturn<ReturnType<EthApi['fetchBalance']>>

// -- BlockCtrl -------------------------------------------- //
export type BlockCtrlWatchOptions = Omit<Parameters<EthApi['watchBlockNumber']>[0], 'listen'>

export type BlockCtrlWatchCallback = Parameters<EthApi['watchBlockNumber']>[1]

// -- NetworkCtrl ------------------------------------------ //
export type NetworkCtrlWatchCallback = Parameters<EthApi['watchNetwork']>[0]

export type NetworkCtrlGetReturnValue = ReturnType<EthApi['getNetwork']>

export type NetworkCtrlSwitchNetworkArgs = Parameters<EthApi['switchNetwork']>[0]

// -- ProviderCtrl ----------------------------------------- //
export type ProviderCtrlWatchOptions = Parameters<EthApi['watchProvider']>[0]

export type ProviderCtrlWatchCallback = Parameters<EthApi['watchProvider']>[1]

// -- WebSocketProviderCtrl -------------------------------- //
export type WebSocketProviderCtrlWatchOptions = Parameters<EthApi['watchWebSocketProvider']>[0]

export type WebSocketProviderCtrlWatchCallback = Parameters<EthApi['watchWebSocketProvider']>[1]

// -- SignerProviderCtrl ----------------------------------- //
export type SignerCtrlWatchCallback = Parameters<EthApi['watchSigner']>[0]

export type SignerCtrlSignMessageArgs = Parameters<EthApi['signMessage']>[0]

export type SignerCtrlSignTypedDataArgs = Parameters<EthApi['signTypedData']>[0]

// -- FeeCtrl ---------------------------------------------- //
export type FeeCtrlFetchArgs = Parameters<EthApi['fetchFeeData']>[0]

export type FeeCtrlFetchReturnValue = ResolvePromiseReturn<ReturnType<EthApi['fetchFeeData']>>

// -- EnsCtrl ---------------------------------------------- //
export type EnsCtrlFetchEnsAddressArgs = Parameters<EthApi['fetchEnsAddress']>[0]

export type EnsCtrlFetchEnsAvatarArgs = Parameters<EthApi['fetchEnsAvatar']>[0]

export type EnsCtrlFetchEnsNameArgs = Parameters<EthApi['fetchEnsName']>[0]

export type EnsCtrlFetchEnsResolverArgs = Parameters<EthApi['fetchEnsResolver']>[0]

// -- TokenCtrl -------------------------------------------- //
export type TokenCtrlFetchArgs = Parameters<EthApi['fetchToken']>[0]

// -- TransactionCtrl -------------------------------------- //
export type TransactionCtrlFetchArgs = Parameters<EthApi['fetchTransaction']>[0]

export type TransactionCtrlSendArgs = Parameters<EthApi['prepareSendTransaction']>[0]

export type TransactionCtrlWaitArgs = Parameters<EthApi['waitForTransaction']>[0]

// -- ContractCtrl ----------------------------------------- //
export type ContractCtrlGetArgs = Parameters<EthApi['getContract']>[0]

export type ContractCtrlReadArgs = Parameters<EthApi['readContract']>[0]

export type ContractCtrlWatchReadArgs = Parameters<EthApi['watchReadContract']>

export type ContractCtrlWriteArgs = Parameters<EthApi['prepareWriteContract']>[0]

export type ContractCtrlWatchEventArgs = Parameters<EthApi['watchContractEvent']>
