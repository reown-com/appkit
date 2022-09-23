import type { Chain, ChainProviderFn } from '@wagmi/core'

export type { Connector } from '@wagmi/core'

export interface GetDefaultConnectorsOpts {
  appName: string
  chains: Chain[]
}

export interface GetWalletConnectProviderOpts {
  projectId: string
}

export interface EthereumOptions {
  appName: string
  autoConnect?: boolean
  chains?: Chain[]
  providers?: ChainProviderFn[]
}
