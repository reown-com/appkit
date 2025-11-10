import type { ProviderInterface } from '@base-org/account'

import { ChainController, OptionsController } from '@reown/appkit-controllers'

import { EthersProvider } from './EthersProvider'

export class BaseProvider extends EthersProvider<ProviderInterface> {
  async initialize(): Promise<void> {
    console.log('BaseProvider:initialize')
    const caipNetworks = ChainController.getCaipNetworks()
    const { metadata, coinbasePreference } = OptionsController.state
    try {
      const { createBaseAccountSDK } = await import('@base-org/account')
      if (typeof window === 'undefined') {
        return undefined
      }

      const baseAccountSdk = createBaseAccountSDK({
        appName: metadata?.name,
        appLogoUrl: metadata?.icons[0],
        appChainIds: caipNetworks?.map(caipNetwork => caipNetwork.id as number) || [1, 84532],
        preference: {
          options: coinbasePreference ?? 'all'
        }
      })

      this.provider = baseAccountSdk.getProvider()
      this.initialized = true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import Coinbase Wallet SDK:', error)

      return undefined
    }
  }

  override async getProvider(): Promise<ProviderInterface | undefined> {
    return Promise.resolve(this.provider)
  }
}
