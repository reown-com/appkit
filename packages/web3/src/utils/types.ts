import type { Web3APISpec, EIP1193Provider } from 'web3-types'

export type Address = `0x${string}`

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface EIP6963ProviderDetail<API = Web3APISpec> {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider<API>
}
