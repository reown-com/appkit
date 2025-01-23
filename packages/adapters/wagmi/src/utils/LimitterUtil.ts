import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

// -- Types --------------------------------------------- //
export interface LimitteStoreUtilState {
  pendingTransactions: number
}

type StateKey = keyof LimitteStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<LimitteStoreUtilState>({
  pendingTransactions: 0
})

// -- Controller ---------------------------------------- //
export const LimitterUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: LimitteStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  increase(value: StateKey) {
    state[value] += 1
  },

  decrease(value: StateKey) {
    state[value] -= 1
  },

  reset(value: StateKey) {
    state[value] = 0
  }
}
