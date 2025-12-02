import type { ProviderInterface } from '@base-org/account'

import { OptionsController } from '@reown/appkit-controllers'

import { EthersProvider } from './EthersProvider.js'

export class BaseProvider extends EthersProvider<ProviderInterface> {
  async initialize(): Promise<void> {
    const { metadata } = OptionsController.state
    try {
      const { createBaseAccountSDK } = await import('@base-org/account')
      if (typeof window === 'undefined') {
        return Promise.resolve()
      }

      const baseAccountSdk = createBaseAccountSDK({
        appName: metadata?.name,
        appLogoUrl: metadata?.icons[0]
      })

      this.provider = baseAccountSdk.getProvider()
      this.initialized = true

      return Promise.resolve()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import Base Account SDK:', error)

      return Promise.resolve()
    }
  }

  override async getProvider(): Promise<ProviderInterface | undefined> {
    return Promise.resolve(this.provider)
  }
}
