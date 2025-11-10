import type { Provider } from '@reown/appkit-controllers'

import { EthersProvider } from './EthersProvider.js'

export class InjectedProvider extends EthersProvider<Provider> {
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.ethereum) {
      return undefined
    }

    this.provider = window.ethereum
    this.initialized = true

    return Promise.resolve()
  }
}
