import '@web3modal/polyfills'

import type { Chain } from '@web3modal/scaffold-utils'
import type { Metadata, SolanaProvider, SolanaProviderType } from './scaffold/index.js'

declare global {
  interface Window {
    originalSolana?: Record<string, unknown>
    solana?: SolanaProvider
    solflare?: { solana: SolanaProvider }
    backpack?: { solana: SolanaProvider }
    trustWallet?: { solana: SolanaProvider }
    phantom?: { solana: SolanaProvider }
    getHashedName: (name: string) => Buffer
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

  let injectedProvider: SolanaProvider | undefined = undefined

  const providers: SolanaProviderType = { metadata }

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

    injectedProvider = window.solana

    return injectedProvider
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  return providers
}
