export interface IEthersConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: Provider
  coinbase?: Provider
  EIP6963?: boolean
  metadata: Metadata
}

export type ExternalProvider = {
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: { method: string; params?: unknown[] },
    callback: (error: unknown, response: unknown) => void
  ) => void
  send?: (
    request: { method: string; params?: unknown[] },
    callback: (error: unknown, response: unknown) => void
  ) => void
  request?: (request: { method: string; params?: unknown[] }) => Promise<unknown>
}

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface Provider {
  request:<T>(args: RequestArguments) => Promise<T>
  on:<T>(event: string , listener: (data: T) => void)=>void
  removeListener:<T>(event: string , listener: (data: T) => void)=>void
  emit:(event: string)=>void
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type Chain = {
  rpcUrl: string
  explorerUrl: string
  currency: string
  name: string
  chainId: number
}
