import '@web3modal/polyfills'

import type { CreateConfigParameters, CreateConnectorFn, Config } from 'wagmi'
import { createConfig } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors'

import { authConnector } from '../connectors/AuthConnector.js'
import { alphaWalletConnect } from '../connectors/alphaWalletConnect.js'
import { getTransport } from './helpers.js'
import type { SocialProvider } from '@web3modal/scaffold-utils'

export type ConfigOptions = Partial<CreateConfigParameters> & {
  chains: CreateConfigParameters['chains']
  projectId: string
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  /**
   * Use enableEIP6963 to show all injected wallets
   * @deprecated
   */
  enableInjected?: boolean
  enableWalletConnect?: boolean
  enableEmail?: boolean
  auth?: {
    socials?: SocialProvider[]
  }
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
  }
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableCoinbase,
  enableWalletConnect,

  enableEIP6963,
  enableEmail,
  auth,
  ...wagmiConfig
}: ConfigOptions): Config {
  const connectors: CreateConnectorFn[] = []
  const transportsArr = chains.map(chain => [
    chain.id,
    getTransport({ chainId: chain.id, projectId })
  ])
  const transports = Object.fromEntries(transportsArr)

  // Enabled by default
  if (enableWalletConnect !== false) {
    connectors.push(alphaWalletConnect({ projectId, metadata, showQrModal: false }))
  }

  if (enableCoinbase !== false) {
    connectors.push(
      coinbaseWallet({
        appName: metadata?.name ?? 'Unknown',
        appLogoUrl: metadata?.icons[0] ?? 'Unknown',
        enableMobileWalletLink: true
      })
    )
  }

  // Dissabled by default
  if (enableEmail || auth?.socials) {
    connectors.push(
      authConnector({
        chains: [...chains],
        options: { projectId },
        socials: auth?.socials,
        email: enableEmail
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
