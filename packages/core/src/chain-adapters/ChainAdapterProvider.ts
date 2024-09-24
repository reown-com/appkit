import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector } from '../utils/TypeUtil.js'

export interface ChainAdapterProvider extends Connector {
  chains: CaipNetwork[]

  connect: (params?: { onUri?: (uri: string) => void }) => Promise<string>
  disconnect: () => Promise<void>
}
