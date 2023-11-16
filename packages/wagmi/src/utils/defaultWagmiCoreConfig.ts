import '@web3modal/polyfills'

import type { Chain, Connector } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'
import { EIP6963Connector } from '../connectors/EIP6963Connector.js'
import { EmailConnector } from '../connectors/EmailConnector.js'
import { walletConnectProvider } from './provider.js'

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
  useInjectedWallets?: boolean
  useEip6963Wallets?: boolean
  useCoinbaseWallet?: boolean
  useEmailWallet?: boolean
}

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
