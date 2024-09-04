import type {
  AppKitOptions,
  ConnectionControllerClient,
  NetworkControllerClient
} from '@rerock/base'
import type { AdapterType, CaipNetwork, ChainNamespace } from '@rerock/common'
import { ConstantsUtil as CommonConstantsUtil } from '@rerock/common'

export class PolkadotClient {
  // Metadata
  public adapterType: AdapterType = 'polkadot'
  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.POLKADOT

  // Adapter
  public options: AppKitOptions | undefined = undefined
  public networkControllerClient: NetworkControllerClient | undefined = undefined
  public connectionControllerClient: ConnectionControllerClient | undefined = undefined
  public defaultCaipNetwork: CaipNetwork | undefined = undefined
}
