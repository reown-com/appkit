import '@web3modal/polyfills'

import type { CreateConfigParameters, CreateConnectorFn } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

import { createClient } from 'viem'

import { emailConnector } from '../connectors/EmailConnector.js'
import type { ConfigOptions } from './defaultWagmiCoreConfig.js'

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableInjected,
  enableCoinbase,
  enableWalletConnect,
  enableEmail,
  enableEIP6963,
  ...wagmiConfig
}: ConfigOptions) {
  const connectors: CreateConnectorFn[] = []

  // Enabled by default
  if (enableWalletConnect !== false) {
    connectors.push(walletConnect({ projectId, metadata, showQrModal: false }))
  }

  if (enableInjected !== false) {
    connectors.push(injected({ shimDisconnect: true }))
  }

  if (enableCoinbase !== false) {
    connectors.push(coinbaseWallet({ appName: metadata?.name ?? 'Unknown' }))
  }

  // Dissabled by default
  if (enableEmail === true) {
    connectors.push(emailConnector({ chains, options: { projectId } }))
  }

  const config = {
    ...wagmiConfig,
    chains,
    connectors,
    multiInjectedProviderDiscovery: enableEIP6963 !== false,
    client({ chain }) {
      return createClient({ chain, transport: http() })
    }
  } as CreateConfigParameters

  return createConfig(config)
}
