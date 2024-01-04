import '@web3modal/polyfills'

import type { Chain, Config, Connector } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'
import { EIP6963Connector } from '../connectors/EIP6963Connector.js'
import { EmailConnector } from '../connectors/EmailConnector.js'
import { walletConnectProvider } from './provider.js'
import type { FallbackTransport, PublicClient } from 'viem'

export interface ConfigOptions {
  projectId: string
  chains: Chain[]
  metadata?: {
    name?: string
    description?: string
    url?: string
    icons?: string[]
    verifyUrl?: string
  }
  enableInjected?: boolean
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  enableWalletConnect?: boolean
}

export type WCDefaultWagmiConfig = Config<PublicClient<FallbackTransport, Chain>>

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableInjected,
  enableCoinbase,
  enableEIP6963,
  enableEmail,
  enableWalletConnect
}: ConfigOptions): WCDefaultWagmiConfig {
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
