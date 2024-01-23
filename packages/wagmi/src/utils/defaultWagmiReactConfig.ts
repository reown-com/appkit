import '@web3modal/polyfills'

import type { CreateConfigParameters, CreateConnectorFn, Config } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

import { emailConnector } from '../connectors/EmailConnector.js'

export interface ConfigOptions {
  chains: CreateConfigParameters['chains']
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
  enableEIP6963
}: ConfigOptions): Config {
  const connectors: CreateConnectorFn[] = []
  const transportsArr = chains.map(chain => [chain.id, http()])
  const transports = Object.fromEntries(transportsArr)

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
    // @ts-expect-error Yes
    connectors.push(emailConnector({ chains: [...chains], options: { projectId } }))
  }

  return createConfig({
    chains,
    connectors,
    multiInjectedProviderDiscovery: enableEIP6963 !== false,
    transports
  })
}
