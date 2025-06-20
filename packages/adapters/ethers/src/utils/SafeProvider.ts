import { SafeAppProvider } from '@safe-global/safe-apps-provider'

export class SafeProvider extends SafeAppProvider {
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
