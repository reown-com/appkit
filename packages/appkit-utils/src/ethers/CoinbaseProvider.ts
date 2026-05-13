import type { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

import { ChainController, OptionsController } from '@reown/appkit-controllers'

import { EthersProvider } from './EthersProvider.js'

type CoinbaseProvider = ReturnType<InstanceType<typeof CoinbaseWalletSDK>['makeWeb3Provider']>

export class CoinbaseWalletProvider extends EthersProvider<CoinbaseProvider> {
  async initialize(): Promise<void> {
    const caipNetworks = ChainController.getCaipNetworks()
    const { metadata, coinbasePreference } = OptionsController.state
    try {
      const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
      if (typeof window === 'undefined') {
        return Promise.resolve()
      }

      const chainIds = caipNetworks?.map(caipNetwork => caipNetwork.id as number) || [1]

      const coinbaseWalletSDK = new CoinbaseWalletSDK({
        appName: metadata?.name || 'AppKit',
        appLogoUrl: metadata?.icons[0],
        appChainIds: chainIds
      })

      this.provider = coinbaseWalletSDK.makeWeb3Provider({
        options: coinbasePreference ?? 'all'
      })
      this.initialized = true

      return Promise.resolve()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import Coinbase Wallet SDK:', error)

      return Promise.resolve()
    }
  }

  override async getProvider(): Promise<CoinbaseProvider | undefined> {
    return Promise.resolve(this.provider)
  }
}
