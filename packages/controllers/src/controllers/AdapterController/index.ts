import type { ChainNamespace } from '@laughingwhales/appkit-common'

import type { AdapterBlueprint } from './ChainAdapterBlueprint.js'

export type Adapters = { [K in ChainNamespace]?: AdapterBlueprint }

export type AdapterControllerState = {
  adapters: Adapters
}

const state: AdapterControllerState = {
  adapters: {}
}

export const AdapterController = {
  state,
  initialize(adapters: Adapters) {
    state.adapters = { ...adapters }
  },
  get(namespace: ChainNamespace) {
    return state.adapters[namespace]
  }
}
