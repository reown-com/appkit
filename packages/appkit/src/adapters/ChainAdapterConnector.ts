import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-controllers'

export interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}
