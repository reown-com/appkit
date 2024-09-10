import type { CaipNetworkId } from '@rerock/common'
import { W3mFrameProvider } from '@rerock/wallet'

export class W3mFrameProviderSingleton {
  private static instance: W3mFrameProvider

  private constructor() {}

  public static getInstance(projectId: string, chainId?: number | CaipNetworkId): W3mFrameProvider {
    if (!W3mFrameProviderSingleton.instance) {
      W3mFrameProviderSingleton.instance = new W3mFrameProvider(projectId, chainId)
    }
    return W3mFrameProviderSingleton.instance
  }
}
