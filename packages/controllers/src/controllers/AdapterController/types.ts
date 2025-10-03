import type { CaipNetwork } from '@reown/appkit-common'

import type { Connector } from '../../utils/TypeUtil.js'

export interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}
