import '@web3modal/polyfills'

import { configureChains, createConfig } from 'wagmi'
import type { Connector } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { EIP6963Connector } from '../connectors/EIP6963Connector.js'
import { EmailConnector } from '../connectors/EmailConnector.js'
import type { ConfigOptions } from './defaultWagmiCoreConfig.js'
import { walletConnectProvider } from './provider.js'

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  useInjectedWallets,
  useCoinbaseWallet,
  useEip6963Wallets,
  useEmailWallet
}: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ])

  const connectors: Connector[] = [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } })
  ]

  if (useInjectedWallets !== false) {
    connectors.push(new InjectedConnector({ chains, options: { shimDisconnect: true } }))
  }

  if (useEmailWallet !== false) {
    connectors.push(new EmailConnector({ chains, options: { projectId } }))
  }

  if (useEip6963Wallets !== false) {
    connectors.push(new EIP6963Connector({ chains }))
  }

  if (useCoinbaseWallet !== false) {
    connectors.push(
      new CoinbaseWalletConnector({ chains, options: { appName: metadata?.name ?? 'Unknown' } })
    )
  }

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })
}
