import type { ChainNamespace } from '@reown/appkit-common'

// REVIEW THIS

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
  initialize(adapters: AdapterBlueprint[]) {
    state.adapters = adapters.reduce<Record<ChainNamespace, AdapterBlueprint>>((acc, adapter) => {
      acc[adapter.namespace as ChainNamespace] = adapter

      return acc
    }, state.adapters)
  },
  get(namespace: ChainNamespace) {
    return state.adapters[namespace] as AdapterBlueprint
  },
  set(namespace: ChainNamespace, adapter: AdapterBlueprint) {
    state.adapters[namespace] = adapter
  }
}
