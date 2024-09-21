import type { CaipNetworkId } from '@reown/appkit-common'
import { W3mFrameProvider } from '@reown/appkit-wallet'

export class AuthProvider {
  private static instance: W3mFrameProvider

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- This is a singleton
  private constructor() {}

  public static getInstance(projectId: string, chainId?: number | CaipNetworkId): W3mFrameProvider {
    if (!AuthProvider.instance) {
      AuthProvider.instance = new W3mFrameProvider(projectId, chainId)
    }

    return AuthProvider.instance
  }
}
