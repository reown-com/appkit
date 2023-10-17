import '@web3modal/polyfills'
import { ethers } from 'ethers'
import type { ExternalProvider, ProviderType } from './types.js'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

export interface ConfigOptions {
  enableEIP6963?: boolean
}

export function defaultConfig(options: ConfigOptions = {}): ProviderType | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const providers: ProviderType = {}

  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'Web3Modal',
    appLogoUrl: 'https://avatars.githubusercontent.com/u/37784886',
    darkMode: false
  })

  const coinbaseProvider = coinbaseWallet.makeWeb3Provider(
    'https://cloudflare-eth.com',
    1
  ) as unknown as ExternalProvider

  providers.coinbase = new ethers.providers.Web3Provider(coinbaseProvider, 'any')

  if (window.ethereum) {
    providers.injected = new ethers.providers.Web3Provider(window.ethereum, 'any')
  }

  if (options.enableEIP6963) {
    providers.EIP6963 = true
  }

  return providers
}
