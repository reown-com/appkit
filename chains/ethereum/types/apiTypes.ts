import type {
  Chain,
  Client,
  FetchBalanceArgs,
  FetchTokenArgs,
  FetchTransactionArgs,
  GetContractArgs,
  PrepareSendTransactionArgs,
  PrepareWriteContractConfig,
  ReadContractConfig,
  SendTransactionArgs,
  SignTypedDataArgs,
  WaitForTransactionArgs,
  WatchReadContractResult,
  WriteContractArgs
} from '@wagmi/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EthereumClient = Client<any, any>

export interface GetDefaultConnectorsOpts {
  appName: string
  chains: Chain[]
}

export interface GetWalletConnectProviderOpts {
  projectId: string
}

export interface GetBalanceOpts {
  addressOrName: string
  chainId: string
  formatUnits: FetchBalanceArgs['formatUnits']
}

export interface SignTypedDataOpts {
  value: SignTypedDataArgs['value']
  domain: SignTypedDataArgs['domain']
  types: SignTypedDataArgs['types']
}

export interface GetContractOpts {
  addressOrName: string
  contractInterface: GetContractArgs['contractInterface']
  signerOrProvider: GetContractArgs['signerOrProvider']
}

export interface ContractOpts {
  addressOrName: string
  functionName: string
  contractInterface: ReadContractConfig['contractInterface']
  args: unknown
  chainId: string
  overrides: ReadContractConfig['overrides']
}

export type PrepareWriteContractOpts = ContractOpts & {
  signer: PrepareWriteContractConfig['signer']
}

export type ReadContractOpts = ContractOpts

export type WriteContractOpts = ContractOpts & {
  request: Exclude<WriteContractArgs['request'], undefined>
}

export type WatchReadContractOpts = ContractOpts & {
  callback: WatchReadContractResult
  listenToBlock: boolean
}

export interface GetTokenOpts {
  address: string
  chainId: string
  formatUnits: FetchTokenArgs['formatUnits']
}

export interface FetchEnsAddressOpts {
  chainId: string
  name: string
}

export interface FetchEnsNameOpts {
  chainId: string
  address: string
}

export interface FetchEnsAvatarOpts {
  chainId: string
  addressOrName: string
}

export interface FetchTransactionOpts {
  chainId: string
  hash: FetchTransactionArgs['hash']
}

export interface PrepareSendTransactionOpts {
  chainId: string
  request: PrepareSendTransactionArgs['request']
  signerOrProvider?: PrepareSendTransactionArgs['signerOrProvider']
}

export interface SendTransactionOpts {
  chainId: string
  request: SendTransactionArgs['request'] & {
    to: `0x${string}`
    gasLimit?: Exclude<SendTransactionArgs['request']['gasLimit'], undefined>
  }
}

export interface WaitForTransactionOpts {
  chainId: string
  confirmation?: number
  hash?: string
  timeout?: number
  wait?: WaitForTransactionArgs['wait']
}
