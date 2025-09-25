import type { ChainNamespace } from '@reown/appkit-common'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdapterBlueprint = any

export type AdapterControllerState = {
  adapters: Record<ChainNamespace, AdapterBlueprint>
}

const state = {
  adapters: {
    eip155: undefined,
    solana: undefined,
    bip122: undefined,
    sui: undefined,
    stacks: undefined,
    polkadot: undefined,
    cosmos: undefined
  }
}

export const AdapterController = {
  state,
  initialize(adapters: Record<ChainNamespace, AdapterBlueprint>) {
    state.adapters = adapters
  },
  get(namespace: ChainNamespace) {
    return state.adapters[namespace] as AdapterBlueprint
  }
}
