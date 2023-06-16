import type { Chain } from '@wagmi/core'

export interface WalletConnectProviderOpts {
  projectId: string
}

export type ConnectorId = 'injected' | 'metaMask' | 'walletConnect' | 'walletConnectV1'

export interface ModalConnectorsOpts {
  chains: Chain[]
  version: 1 | 2
  projectId: string
}
