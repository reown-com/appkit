import type { Assign, Prettify, ChainFormatters } from 'viem'
import type { CaipNetwork } from '@reown/appkit-common'

export function defineChain<
  formatters extends ChainFormatters,
  const chain extends CaipNetwork<formatters>
>(chain: chain): Prettify<Assign<CaipNetwork<undefined>, chain>> {
  return {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain
  } as Assign<CaipNetwork<undefined>, chain>
}
