import type {
  CaipNetwork,
  CaipNetworkId,
  ChainNamespace,
  EmbeddedWalletTimeoutReason
} from '@reown/appkit-common'
import { OptionsController } from '@reown/appkit-controllers'
import { W3mFrameProvider } from '@reown/appkit-wallet'

interface W3mFrameProviderConfig {
  projectId: string
  chainId: number | CaipNetworkId | undefined
  enableLogger?: boolean
  onTimeout?: (reason: EmbeddedWalletTimeoutReason) => void
  abortController: AbortController
  getActiveCaipNetwork: (namespace?: ChainNamespace) => CaipNetwork | undefined
}

export class W3mFrameProviderSingleton {
  private static instance: W3mFrameProvider

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- This is a singleton
  private constructor() {}

  public static getInstance({
    projectId,
    chainId,
    enableLogger,
    onTimeout,
    abortController,
    getActiveCaipNetwork
  }: W3mFrameProviderConfig): W3mFrameProvider {
    if (!W3mFrameProviderSingleton.instance) {
      W3mFrameProviderSingleton.instance = new W3mFrameProvider({
        projectId,
        chainId,
        enableLogger,
        onTimeout,
        abortController,
        getActiveCaipNetwork,
        enableCloudAuthAccount: Boolean(OptionsController.state.remoteFeatures?.emailCapture)
      })
    }

    return W3mFrameProviderSingleton.instance
  }
}
