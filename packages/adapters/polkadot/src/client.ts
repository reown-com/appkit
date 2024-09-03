import type {
  AppKit,
  AppKitOptions,
  ConnectionControllerClient,
  NetworkControllerClient
} from '@web3modal/base'
import type { AdapterType, CaipNetwork, ChainNamespace } from '@web3modal/common'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

export class PolkadotClient {
  // Metadata
  public adapterType: AdapterType = 'polkadot'
  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.POLKADOT

  // Adapter
  public options: AppKitOptions | undefined = undefined
  public networkControllerClient: NetworkControllerClient | undefined = undefined
  public connectionControllerClient: ConnectionControllerClient | undefined = undefined
  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  private appKit: AppKit | undefined = undefined
}
