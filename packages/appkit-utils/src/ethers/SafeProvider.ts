import { SafeAppProvider } from '@safe-global/safe-apps-provider'

import { EthersProvider } from './EthersProvider'

export class _SafeProvider extends SafeAppProvider {
  // Safe Provider doesn't support eth_requestAccounts, so we need to override the request method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override request(request: { method: string; params?: any[] }): Promise<any> {
    if (request.method === 'eth_requestAccounts') {
      return this.request({
        method: 'eth_accounts',
        params: []
      })
    }

    return super.request(request)
  }
}

export class SafeProvider extends EthersProvider<_SafeProvider> {
  async initialize(): Promise<void> {
    const { default: SafeAppsSDK } = await import('@safe-global/safe-apps-sdk')
    const appsSdk = new SafeAppsSDK()
    const info = await appsSdk.safe.getInfo()

    const provider = new _SafeProvider(info, appsSdk)
    await provider.connect().catch(error => {
      // eslint-disable-next-line no-console
      console.info('Failed to auto-connect to Safe:', error)
    })

    this.provider = provider
    this.initialized = true
  }

  override async getProvider(): Promise<_SafeProvider | undefined> {
    return Promise.resolve(this.provider)
  }
}
