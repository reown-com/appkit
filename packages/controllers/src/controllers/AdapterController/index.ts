import type { ChainNamespace } from '@reown/appkit-common'

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
  initialize(adapters: AdapterBlueprint[]) {
    adapters.forEach(adapter => {
      if (!adapter.namespace) {
        throw new Error('AdapterController:initialize - adapter must have a namespace')
      }

      state.adapters[adapter.namespace] = adapter
    })
  },
  get(namespace: ChainNamespace) {
    return state.adapters[namespace]
  }
}
