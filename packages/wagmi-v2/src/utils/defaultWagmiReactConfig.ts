import '@web3modal/polyfills'

import { configureChains, createConfig } from 'wagmi'
import type { Connector } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors'
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
  enableInjected,
  enableCoinbase,
  enableEIP6963,
  enableEmail,
  enableWalletConnect
}: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ])

  const connectors: Connector[] = []

  // Enabled by default
  if (enableWalletConnect !== false) {
    connectors.push(
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } })
    )
  }

  if (enableInjected !== false) {
    connectors.push(new InjectedConnector({ chains, options: { shimDisconnect: true } }))
  }

  if (enableEIP6963 !== false) {
    connectors.push(new EIP6963Connector({ chains }))
  }

  if (enableCoinbase !== false) {
    connectors.push(
      new CoinbaseWalletConnector({ chains, options: { appName: metadata?.name ?? 'Unknown' } })
    )
  }

  // Dissabled by default
  if (enableEmail === true) {
    connectors.push(new EmailConnector({ chains, options: { projectId } }))
  }

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })
}
