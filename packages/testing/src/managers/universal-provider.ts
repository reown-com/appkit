import UniversalProvider, { type NamespaceConfig } from '@walletconnect/universal-provider'

// -- Constants ----------------------------------------------------------------
const DEFAULT_PROJECT_ID = '1b0841d0acfe3e32dcb0d53dbf505bdd'

// -- Types --------------------------------------------------------------------
type ListenEventsParams = {
  onConnect?: () => void
  onDisplayUri?: (uri: string) => void
}

export class UniversalProviderManager {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private provider: UniversalProvider | null = null

  public async init(projectId = DEFAULT_PROJECT_ID) {
    this.provider = await UniversalProvider.init({ projectId })

    return this.provider
  }

  public getProvider() {
    if (!this.provider) {
      throw new Error('UniversalProvider has not been initialized. Call `init()` first.')
    }

    return this.provider
  }

  public async connect(namespaces: NamespaceConfig) {
    const provider = this.getProvider()

    await provider.connect({
      optionalNamespaces: namespaces
    })
  }

  public async disconnect() {
    const provider = this.getProvider()

    await provider.disconnect()
  }

  public async request(method: string, params: unknown[]) {
    const provider = this.getProvider()

    await provider.request({ method, params })
  }

  public on(event: string, listener: (...args: unknown[]) => void) {
    const provider = this.getProvider()

    provider.on(event, listener)
  }

  public off(event: string, listener: (...args: unknown[]) => void) {
    const provider = this.getProvider()

    provider.off(event, listener)
  }

  public listenEvents({ onConnect, onDisplayUri }: ListenEventsParams) {
    const provider = this.getProvider()

    if (onConnect) {
      provider.on('connect', onConnect)
    }
    if (onDisplayUri) {
      provider.on('display_uri', onDisplayUri)
    }
  }
}
