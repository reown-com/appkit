import '@web3modal/polyfills'

import { configureChains, createConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { EIP6963Connector } from '../connectors/EIP6963Connector.js'
import type { ConfigOptions } from './defaultWagmiCoreConfig.js'
import { walletConnectProvider } from './provider.js'

export function defaultWagmiConfig({ projectId, chains, metadata }: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ])

  return createConfig({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
      new EIP6963Connector({ chains }),
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName: metadata?.name ?? 'Unknown' } })
    ],
    publicClient
  })
}
