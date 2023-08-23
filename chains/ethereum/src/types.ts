import type { Chain } from '@wagmi/core'

export interface WalletConnectProviderOpts {
  projectId: string
}

export type ConnectorId = 'injected' | 'metaMask' | 'walletConnect'

export interface ModalConnectorsOpts {
  chains: Chain[]
  projectId: string
}
