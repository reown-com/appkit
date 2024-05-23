import '@web3modal/polyfills'
import type { Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/ethers'
import { CoinbaseWalletSDK, type ProviderInterface } from '@coinbase/wallet-sdk'

export interface ConfigOptions {
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableInjected?: boolean
  rpcUrl?: string
  defaultChainId?: number
  metadata: Metadata
}

export function defaultConfig(options: ConfigOptions) {
  const {
    enableEIP6963 = true,
    enableInjected = true,
    enableCoinbase = true,
    metadata,
    rpcUrl,
    defaultChainId
  } = options

  let injectedProvider: Provider | undefined = undefined
  let coinbaseProvider: ProviderInterface | undefined = undefined

  const providers: ProviderType = { metadata }

  function getInjectedProvider() {
    if (injectedProvider) {
      return injectedProvider
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.ethereum) {
      return undefined
    }

    //  @ts-expect-error window.ethereum satisfies Provider
    injectedProvider = window.ethereum

    return injectedProvider
  }

  function getCoinbaseProvider() {
    if (coinbaseProvider) {
      return coinbaseProvider
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })

    coinbaseProvider = coinbaseWallet.makeWeb3Provider({
      options: 'all'
    })

    return coinbaseProvider
  }

  if (enableCoinbase && rpcUrl && defaultChainId) {
    providers.coinbase = getCoinbaseProvider()
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  if (enableEIP6963) {
    providers.EIP6963 = true
  }

  return providers
}
