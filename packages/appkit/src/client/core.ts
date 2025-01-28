import UniversalProvider from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'
import type { ConnectionControllerClient, NetworkControllerClient } from '@reown/appkit-core'

export class AppKitCore {
  protected universalProvider?: UniversalProvider
  protected connectionControllerClient?: ConnectionControllerClient
  protected networkControllerClient?: NetworkControllerClient
  protected static instance?: AppKitCore
  protected universalProviderInitPromise?: Promise<void>
  protected caipNetworks?: [CaipNetwork, ...CaipNetwork[]]
  protected defaultCaipNetwork?: CaipNetwork

  constructor() {
    console.log('AppKitCore constructor')
  }
}
