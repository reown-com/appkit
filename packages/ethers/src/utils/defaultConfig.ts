import '@web3modal/polyfills'
import type { Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/ethers'
import { CoinbaseWalletSDK, type ProviderInterface } from '@coinbase/wallet-sdk'
import type { SocialProvider } from '@web3modal/scaffold-utils'

export interface ConfigOptions {
  enableEIP6963?: boolean
  enableCoinbase?: boolean
  enableEmail?: boolean
  auth?: {
    socials?: SocialProvider[]
    showWallets?: boolean
  }
  enableInjected?: boolean
  rpcUrl?: string
  defaultChainId?: number
  metadata: Metadata
}

export function defaultConfig(options: ConfigOptions) {
  const {
    enableEIP6963 = true,
    enableCoinbase = true,
    enableInjected = true,
    enableEmail = false,
    auth,
    metadata,
    rpcUrl,
    defaultChainId
  } = options

  let injectedProvider: Provider | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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
      appLogoUrl: metadata.icons[0],
      appChainIds: [1, 84532]
    })

    coinbaseProvider = coinbaseWallet.makeWeb3Provider({
      options: 'all'
    })

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

  if (enableEmail) {
    providers.email = true
  }

  if (auth) {
    providers.auth = auth
  }

  return providers
}
