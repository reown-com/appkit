import '@web3modal/polyfills'
import { ethers } from 'ethers'
import type { ExternalProvider, Metadata, ProviderType } from './types.js'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

export interface ConfigOptions {
  enableEIP6963?: boolean
  enableInjected?: boolean
  enableCoinbase?: boolean
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

  let injectedProvider: ethers.providers.Web3Provider | undefined = undefined
  let coinbaseProvider: ethers.providers.Web3Provider | undefined = undefined

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

    injectedProvider = new ethers.providers.Web3Provider(window.ethereum, 'any')

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
      appLogoUrl: metadata.icons[0],
      darkMode: false
    })

    const coinbaseWalletProvider = coinbaseWallet.makeWeb3Provider(
      rpcUrl,
      defaultChainId
    ) as unknown as ExternalProvider

    coinbaseProvider = new ethers.providers.Web3Provider(coinbaseWalletProvider, 'any')

    return coinbaseProvider
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  if (enableCoinbase && rpcUrl && defaultChainId) {
    providers.coinbase = getCoinbaseProvider()
  }

  if (enableEIP6963) {
    providers.EIP6963 = true
  }

  return providers
}
