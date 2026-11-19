import type { Assign, ChainFormatters } from 'viem'

import type { CaipNetwork } from '@reown/appkit-common'

export type DefinedCaipNetwork<chain> = Assign<CaipNetwork<undefined>, chain>

export function defineChain<
  formatters extends ChainFormatters,
  const chain extends CaipNetwork<formatters>
>(chain: chain): DefinedCaipNetwork<chain> {
  return {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain
  } as Assign<CaipNetwork<undefined>, chain>
}
