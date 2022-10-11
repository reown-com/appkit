/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type * as WagmiTypes from '@wagmi/core'
import { chain, configureChains, createClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import type { EthereumOptions } from '../../types/apiTypes'
import { defaultConnectors } from './wagmiTools'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client = undefined as WagmiTypes.Client<any, any> | undefined

export function getClient() {
  return client
}

export function initializeClient(options: EthereumOptions) {
  const configChains = options.chains ?? [chain.mainnet]
  const configProviders = options.providers ?? [publicProvider()]
  const configAutoConnect = options.autoConnect ?? true

  const { chains, provider, webSocketProvider } = configureChains(configChains, configProviders)

  const wagmiClient = createClient({
    autoConnect: configAutoConnect,
    connectors: defaultConnectors({ chains, appName: options.appName }),
    provider,
    webSocketProvider
  })

  client = wagmiClient
}
