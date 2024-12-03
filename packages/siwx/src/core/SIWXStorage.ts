import type { CaipNetworkId } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-core'

export interface SIWXStorage {
  add(session: SIWXSession): Promise<void>
  delete(chainId: CaipNetworkId, address: string): Promise<void>
  get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]>
  set(sessions: SIWXSession[]): Promise<void>
}
