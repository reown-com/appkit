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
