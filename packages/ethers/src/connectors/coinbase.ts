import type { Provider } from '../utils/EthersTypesUtil.js'
import { Injected } from './injected.js'

export class EIP6963Connector extends Injected {
  private provider?: Provider
  name: string

  constructor({
    appName,
    appLogoUrl,
    darkMode,
    defaultChainId,
    defaultJsonRpcUrl
  }: {
    appName: string
    appLogoUrl?: string
    darkMode?: boolean
    defaultChainId?: number
    defaultJsonRpcUrl?: string
  }) {
    super({
      id: 'coinbase',
      type: 'EXTERNAL'
    })

    const getProvider = async () => {
      if (typeof window === 'undefined') {
        return undefined
      }

      if (this.provider) {
        return this.provider
      }

      let CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default
      if (
        typeof CoinbaseWalletSDK !== 'function' &&
        // @ts-expect-error This import error is not visible to TypeScript
        typeof CoinbaseWalletSDK.default === 'function'
      ) {
        CoinbaseWalletSDK = (CoinbaseWalletSDK as unknown as { default: typeof CoinbaseWalletSDK })
          .default
      }

      const coinbaseWallet = new CoinbaseWalletSDK({
        appName,
        appLogoUrl,
        darkMode
      })

      this.provider = coinbaseWallet.makeWeb3Provider(defaultJsonRpcUrl, defaultChainId)

      return this.provider
    }

    this.name = 'Coinbase'
    this.provider = undefined
    this.getProvider = getProvider
  }
}
