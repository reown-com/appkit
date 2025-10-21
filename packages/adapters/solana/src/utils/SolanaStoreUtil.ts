import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { Connection } from '@reown/appkit-utils/solana'

type StateKey = keyof SolStoreUtilState

export interface SolStoreUtilState {
  connection: Connection | null
}

const state = proxy<SolStoreUtilState>({
  connection: null
})

export const SolStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SolStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SolStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setConnection(connection: Connection) {
    state.connection = ref(connection)
  }
}
