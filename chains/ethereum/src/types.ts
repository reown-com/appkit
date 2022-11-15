import type { Chain } from '@wagmi/core'

export interface ModalConnectorsOpts {
  appName: string
  chains: Chain[]
  desktopWallets?: string[]
  mobileWallets?: string[]
}

export interface WalletConnectProviderOpts {
  projectId: string
}

export type ConnectorId = 'coinbaseWallet' | 'injected' | 'metaMask' | 'walletConnect'
