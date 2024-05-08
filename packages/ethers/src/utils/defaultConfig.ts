import '@web3modal/polyfills'
import type { Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/ethers'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

export interface ConfigOptions {
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  /**
   * @deprecated use enableEIP6963 to show all injected wallets
   */
  enableInjected?: boolean
  rpcUrl?: string
  defaultChainId?: number
  metadata: Metadata
}

export function defaultConfig(options: ConfigOptions) {
  const {
    enableEIP6963 = true,
    enableCoinbase = true,
    enableEmail = false,
    metadata,
    rpcUrl,
    defaultChainId
  } = options

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let coinbaseProvider: Provider | undefined = undefined

  const providers: ProviderType = { metadata }

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
      darkMode: false,
      enableMobileWalletLink: true
    })

    coinbaseProvider = coinbaseWallet.makeWeb3Provider(rpcUrl, defaultChainId)

    return coinbaseProvider
  }

  if (enableCoinbase && rpcUrl && defaultChainId) {
    providers.coinbase = getCoinbaseProvider()
  }

  if (enableEIP6963) {
    providers.EIP6963 = true
  }

  if (enableEmail) {
    providers.email = true
  }

  return providers
}
