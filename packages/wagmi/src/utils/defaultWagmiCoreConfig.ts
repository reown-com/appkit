import '@web3modal/polyfills'

import type { CreateConfigParameters, CreateConnectorFn } from '@wagmi/core'
import { createConfig, http } from '@wagmi/core'
import { coinbaseWallet, walletConnect, injected } from '@wagmi/connectors'

import { createClient } from 'viem'

import { emailConnector } from '../connectors/EmailConnector.js'

export interface ConfigOptions
  extends Omit<CreateConfigParameters, 'client' | 'connectors' | 'multiInjectedProviderDiscovery'> {
  projectId: string
  enableInjected?: boolean
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  enableWalletConnect?: boolean
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
    verifyUrl?: string
  }
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableInjected,
  enableCoinbase,
  enableEmail,
  enableWalletConnect,
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
    connectors.push(
      coinbaseWallet({
        appName: metadata?.name ?? 'Unknown',
        appLogoUrl: metadata?.icons[0] ?? 'Unknown'
      })
    )
  }

  // Dissabled by default
  if (enableEmail === true) {
    connectors.push(emailConnector({ chains, options: { projectId } }))
  }

  const baseConfig = {
    ...wagmiConfig,
    chains,
    connectors,
    multiInjectedProviderDiscovery: enableEIP6963 !== false,
    client({ chain }) {
      return createClient({ chain, transport: http() })
    }
  } as CreateConfigParameters

  return createConfig(baseConfig)
}
