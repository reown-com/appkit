import '@web3modal/polyfills'
import type { SocialProvider } from '@web3modal/scaffold-utils'

import type { Chain, Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/solana'

declare global {
  interface Navigator {
    brave?: {
      isBrave(): boolean
    }
  }
  interface Window {
    originalSolana?: Record<string, unknown>
    solana?: Provider
    solflare?: { solana: Provider & { isSoflare: boolean } }
    backpack?: { solana: Provider }
    trustWallet?: { solana: Provider }
    phantom?: { solana: Provider & { isPhantom: boolean } }
    getHashedName: (name: string) => Buffer
  }
}

export interface ConfigOptions extends Pick<Provider, 'auth'> {
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

  const providers: ProviderType = { metadata, auth: options.auth }

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

  const defaultAuth = {
    email: true,
    showWallets: true,
    walletFeatures: true,
    socials: [
      'google',
      'x',
      'discord',
      'farcaster',
      'github',
      'apple',
      'facebook'
    ] as SocialProvider[]
  }

  providers.auth = {
    ...defaultAuth,
    ...options.auth
  }

  return providers
}
