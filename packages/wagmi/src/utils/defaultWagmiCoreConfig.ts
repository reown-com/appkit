import '@web3modal/polyfills'

import type { Config, CreateConfigParameters, CreateConnectorFn } from '@wagmi/core'
import type { Chain } from 'viem/chains'
import { createConfig } from '@wagmi/core'

import { createClient, http } from 'viem'
import { coinbaseWallet, walletConnect, injected } from '@wagmi/connectors'
import { emailConnector } from '../connectors/EmailConnector.js'

export interface ConfigOptions
  extends Omit<
    CreateConfigParameters,
    'client' | 'chains' | 'connectors' | 'multiInjectedProviderDiscovery'
  > {
  projectId: string
  chains: Chain[]
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
    verifyUrl: string
  }
  enableInjected?: boolean
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  enableWalletConnect?: boolean
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
}: ConfigOptions): Config {
  const connectors: CreateConnectorFn[] = []

  if (!chains.length) {
    throw new Error('No chains provided')
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
    client: ({ chain }: { chain: Chain }) => createClient({ chain, transport: http() }),
    chains: chains as [Chain, ...Chain[]],
    connectors,
    multiInjectedProviderDiscovery: enableEIP6963 !== false
  } as CreateConfigParameters

  return createConfig(baseConfig)
}
