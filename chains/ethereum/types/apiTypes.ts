import type { Chain, createClient } from '@wagmi/core'

export type EthereumClient = ReturnType<typeof createClient>

export interface GetDefaultConnectorsOpts {
  appName: string
  chains: Chain[]
}

export interface GetWalletConnectProviderOpts {
  projectId: string
}
