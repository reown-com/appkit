import '@web3modal/polyfills'

import type { Chain, Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/solana'

declare global {
  interface Window {
    originalSolana?: Record<string, unknown>
    solana?: Record<string, any>
    solflare?: Record<string, any>
    phantom?: Record<string, any>
  }
}

export interface ConfigOptions {
  projectId?: string
  chains: Chain[]
  enableInjected?: boolean
  rpcUrl?: string
  defaultChainId?: number
  metadata: Metadata
}

export function defaultSolanaConfig(options: ConfigOptions) {
  const { enableInjected = true, metadata } = options

  let injectedProvider: Provider | undefined = undefined

  const providers: ProviderType = { metadata }

  function getInjectedProvider() {
    if (injectedProvider) {
      return injectedProvider
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.solana) {
      return undefined
    }

    //  @ts-expect-error window.ethereum satisfies Provider
    injectedProvider = window.solana

    return injectedProvider
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  return providers
}
