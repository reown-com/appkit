import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-core'

export interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}
