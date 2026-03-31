import type {
  CaipNetwork,
  CaipNetworkId,
  ChainNamespace,
  EmbeddedWalletTimeoutReason,
  SdkVersion
} from '@reown/appkit-common'
import { type Metadata, OptionsController } from '@reown/appkit-controllers'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

interface W3mFrameProviderConfig {
  projectId: string
  chainId: number | CaipNetworkId | undefined
  enableLogger?: boolean
  onTimeout?: (reason: EmbeddedWalletTimeoutReason) => void
  abortController: AbortController
  getActiveCaipNetwork: (namespace?: ChainNamespace) => CaipNetwork | undefined
  getCaipNetworks: () => CaipNetwork[]
}

export class W3mFrameProviderSingleton {
  private static instancePromise: Promise<W3mFrameProvider> | undefined

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- This is a singleton
  private constructor() {}

  public static getInstance(config: W3mFrameProviderConfig): Promise<W3mFrameProvider> {
    if (!W3mFrameProviderSingleton.instancePromise) {
      W3mFrameProviderSingleton.instancePromise = W3mFrameProviderSingleton.createInstance(config)
    }

    return W3mFrameProviderSingleton.instancePromise
  }

  private static async createInstance({
    projectId,
    chainId,
    enableLogger,
    onTimeout,
    abortController,
    getActiveCaipNetwork,
    getCaipNetworks
  }: W3mFrameProviderConfig): Promise<W3mFrameProvider> {
    const { metadata, sdkVersion, sdkType } = OptionsController.getSnapshot()
    const { W3mFrameProvider: Provider } = await import('@reown/appkit-wallet')

    return new Provider({
      projectId,
      chainId,
      enableLogger,
      onTimeout,
      abortController,
      getActiveCaipNetwork,
      getCaipNetworks,
      enableCloudAuthAccount: Boolean(OptionsController.state.remoteFeatures?.emailCapture),
      metadata: metadata as Metadata,
      sdkVersion: sdkVersion as SdkVersion,
      sdkType
    })
  }
}
