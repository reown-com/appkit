import type { Provider } from '@reown/appkit-controllers'

export abstract class EthersProvider<T> {
  protected provider?: T
  public initialized = false

  abstract initialize(): Promise<void>

  async getProvider(): Promise<T | undefined> {
    return Promise.resolve(this.provider)
  }
}

declare global {
  interface Window {
    ethereum: Provider
  }
}
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
  }
}
