import type { CaipNetworkId } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-core'

export abstract class SIWXStorageBlueprint {
  abstract add(session: SIWXSession): Promise<void>
  abstract delete(chainId: string, address: string): Promise<void>
  abstract get(chainId: CaipNetworkId): Promise<SIWXSession[]>
  abstract set(sessions: SIWXSession[]): Promise<void>
}
