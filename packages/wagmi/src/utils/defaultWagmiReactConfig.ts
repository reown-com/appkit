import '@web3modal/polyfills'

import type { Chain } from 'wagmi'
import { configureChains, createConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
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
