import '@web3modal/polyfills'

import { configureChains, createConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import type { ConfigOptions } from './defaultWagmiCoreConfig.js'
import { walletConnectProvider } from './provider.js'

export function defaultWagmiConfig({ projectId, chains, appName }: ConfigOptions) {
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
