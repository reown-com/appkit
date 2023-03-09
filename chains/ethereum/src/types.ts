import type { Chain } from '@wagmi/core'

export interface ModalConnectorsOpts {
  chains: Chain[]
  version: 1 | 2
  projectId: string
}

export interface WalletConnectProviderOpts {
  projectId: string
}

export type ConnectorId = 'injected' | 'metaMask' | 'walletConnect' | 'walletConnectV1'
