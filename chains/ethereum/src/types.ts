import type { Chain } from '@wagmi/core'

export interface ModalConnectorsOpts {
  appName: string
  chains: Chain[]
  version: '1' | '2'
  projectId: string
}

export interface WalletConnectProviderOpts {
  projectId: string
}

export type ConnectorId =
  | 'coinbaseWallet'
  | 'injected'
  | 'metaMask'
  | 'walletConnect'
  | 'walletConnectV1'
