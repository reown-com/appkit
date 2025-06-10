import type { CaipNetworkId, EmbeddedWalletTimeoutReason } from '@reown/appkit-common'
import { W3mFrameProvider } from '@reown/appkit-wallet'

interface W3mFrameProviderConfig {
  projectId: string
  chainId: number | CaipNetworkId | undefined
  enableLogger?: boolean
  onTimeout?: (reason: EmbeddedWalletTimeoutReason) => void
  abortController: AbortController
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
    abortController
  }: W3mFrameProviderConfig): W3mFrameProvider {
    if (!W3mFrameProviderSingleton.instance) {
      W3mFrameProviderSingleton.instance = new W3mFrameProvider({
        projectId,
        chainId,
        enableLogger,
        onTimeout,
        abortController
      })
    }

    return W3mFrameProviderSingleton.instance
  }
}
