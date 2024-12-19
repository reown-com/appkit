import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface LimitStoreUtilState {
  pendingTransactions: number
}

type StateKey = keyof LimitStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<LimitStoreUtilState>({
  pendingTransactions: 0
})

// -- Controller ---------------------------------------- //
export const LimitUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: LimitStoreUtilState[K]) => void) {
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
