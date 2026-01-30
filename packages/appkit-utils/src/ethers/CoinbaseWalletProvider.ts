import type { ProviderInterface } from '@coinbase/wallet-sdk'

import { ChainController, OptionsController } from '@reown/appkit-controllers'

import { EthersProvider } from './EthersProvider.js'

export class CoinbaseWalletProvider extends EthersProvider<ProviderInterface> {
  async initialize(): Promise<void> {
    const caipNetworks = ChainController.getCaipNetworks()
    const { metadata } = OptionsController.state
    try {
      const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
      if (typeof window === 'undefined') {
        return Promise.resolve()
      }

      const sdk = new CoinbaseWalletSDK({
        appName: metadata?.name ?? '',
        appLogoUrl: metadata?.icons[0] ?? null,
        appChainIds: caipNetworks?.map(caipNetwork => caipNetwork.id as number) || [1, 84532]
      })

      this.provider = sdk.makeWeb3Provider({ options: 'all' })
      this.initialized = true

      return Promise.resolve()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import Coinbase Wallet SDK:', error)

      return Promise.resolve()
    }
  }

  override async getProvider(): Promise<ProviderInterface | undefined> {
    return Promise.resolve(this.provider)
  }
}
