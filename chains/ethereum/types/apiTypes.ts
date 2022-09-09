import type { Chain, Client, FetchBalanceArgs, SignTypedDataArgs } from '@wagmi/core'

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
  address: string
  chainId: string
  formatUnits: FetchBalanceArgs['formatUnits']
}

export interface SignTypedDataOpts {
  value: SignTypedDataArgs['value']
  domain: SignTypedDataArgs['domain']
  types: SignTypedDataArgs['types']
}
