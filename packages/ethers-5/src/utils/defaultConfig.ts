import '@web3modal/polyfills'
import { ethers } from 'ethers'
import type { ExternalProvider, ProviderType } from './types.js'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

export interface ConfigOptions {
  enableEIP6963?: boolean
  enableInjected?: boolean
  enableCoinbase?: boolean
}

export function defaultConfig(options: ConfigOptions = {}): ProviderType | undefined {
  const { enableEIP6963 = true, enableInjected = true, enableCoinbase = true } = options

  let injectedProvider: ethers.providers.Web3Provider | undefined = undefined
  let coinbaseProvider: ethers.providers.Web3Provider | undefined = undefined

  const providers: ProviderType = {}

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

    if (!window.ethereum) {
      return undefined
    }

    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Web3Modal',
      appLogoUrl: 'https://avatars.githubusercontent.com/u/37784886',
      darkMode: false
    })

    const coinbaseWalletProvider = coinbaseWallet.makeWeb3Provider(
      'https://cloudflare-eth.com',
      1
    ) as unknown as ExternalProvider

    coinbaseProvider = new ethers.providers.Web3Provider(coinbaseWalletProvider, 'any')

    return coinbaseProvider
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  if (enableCoinbase) {
    providers.coinbase = getCoinbaseProvider()
  }

  if (enableEIP6963) {
    providers.EIP6963 = true
  }

  return providers
}
