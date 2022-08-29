import type { Chain, Client } from '@wagmi/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EthereumClient = Client<any, any>

export interface GetDefaultConnectorsOpts {
  appName: string
  chains: Chain[]
}

export interface GetWalletConnectProviderOpts {
  projectId: string
}
