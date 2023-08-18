import '@web3modal/polyfills'

import type { Chain } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { walletConnectProvider } from './provider.js'

export interface DefaultConfigOptions {
  appName: string
  projectId: string
  chains: Chain[]
}

export function defaultWagmiConfig({ projectId, chains, appName }: DefaultConfigOptions) {
  const { publicClient, webSocketPublicClient } = configureChains(chains, [
    walletConnectProvider({ projectId })
  ])

  return createConfig({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({ options: { projectId, showQrModal: false } }),
      new InjectedConnector({ options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ options: { appName } })
    ],
    publicClient,
    webSocketPublicClient
  })
}
