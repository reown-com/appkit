import type { Chain } from '@wagmi/core'

export interface ModalConnectorsOpts {
  appName: string
  chains: Chain[]
}

export interface WalletConnectProviderOpts {
  projectId: string
}
