import type { AppKitOptions, ConnectionControllerClient } from '@reown/appkit'
import type { AdapterType, CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

export class PolkadotClient {
  // Metadata
  public adapterType: AdapterType = 'polkadot'
  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.POLKADOT

  // Adapter
  public options: AppKitOptions | undefined = undefined
  public connectionControllerClient: ConnectionControllerClient | undefined = undefined
  public defaultCaipNetwork: CaipNetwork | undefined = undefined
}
