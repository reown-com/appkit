import '@web3modal/polyfills'

import type { Chain } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { W3mAnnouncedConnector } from '../connectors/W3mAnnouncedConnector.js'
import { walletConnectProvider } from './provider.js'

export interface ConfigOptions {
  appName: string
  projectId: string
  chains: Chain[]
}

export function defaultWagmiConfig({ projectId, chains, appName }: ConfigOptions) {
  const { publicClient, webSocketPublicClient } = configureChains(chains, [
    walletConnectProvider({ projectId })
  ])

  return createConfig({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false } }),
      new W3mAnnouncedConnector({ chains }),
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName } })
    ],
    publicClient,
    webSocketPublicClient
  })
}
