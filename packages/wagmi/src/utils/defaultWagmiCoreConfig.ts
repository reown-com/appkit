import '@web3modal/polyfills'

import type { CreateConfigParameters, CreateConnectorFn } from '@wagmi/core'
import { createConfig } from '@wagmi/core'
import { coinbaseWallet, walletConnect, injected } from '@wagmi/connectors'
import { authConnector } from '../connectors/AuthConnector.js'
import { getTransport } from './helpers.js'
import type { SocialProvider } from '@web3modal/scaffold-utils'

export type ConfigOptions = Partial<CreateConfigParameters> & {
  chains: CreateConfigParameters['chains']
  projectId: string
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  auth?: {
    email?: boolean
    socials?: SocialProvider[]
    showWallets?: boolean
    walletFeatures?: boolean
  }
  enableInjected?: boolean
  enableWalletConnect?: boolean
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
  }
  coinbasePreference?: 'all' | 'smartWalletOnly' | 'eoaOnly'
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableCoinbase,
  enableInjected,
  auth = {},
  enableWalletConnect,
  enableEIP6963,
  ...wagmiConfig
}: ConfigOptions) {
  const connectors: CreateConnectorFn[] = []
  const transportsArr = chains.map(chain => [chain.id, getTransport({ chain, projectId })])
  const transports = Object.fromEntries(transportsArr)
  const defaultAuth = {
    email: true,
    showWallets: true,
    walletFeatures: true
  }

  // Enabled by default
  if (enableWalletConnect !== false) {
    connectors.push(walletConnect({ projectId, metadata, showQrModal: false }))
  }

  if (enableInjected !== false) {
    connectors.push(injected({ shimDisconnect: true }))
  }

  if (enableCoinbase !== false) {
    connectors.push(
      coinbaseWallet({
        version: '4',
        appName: metadata?.name ?? 'Unknown',
        appLogoUrl: metadata?.icons[0] ?? 'Unknown',
        preference: wagmiConfig.coinbasePreference || 'all'
      })
    )
  }

  const mergedAuth = {
    ...defaultAuth,
    ...auth
  }

  if (mergedAuth.email || mergedAuth.socials) {
    connectors.push(
      authConnector({
        chains: [...chains],
        options: { projectId },
        socials: mergedAuth.socials,
        email: mergedAuth.email,
        showWallets: mergedAuth.showWallets,
        walletFeatures: mergedAuth.walletFeatures
      })
    )
  }

  return createConfig({
    chains,
    multiInjectedProviderDiscovery: enableEIP6963 !== false,
    transports,
    ...wagmiConfig,
    connectors
  })
}
