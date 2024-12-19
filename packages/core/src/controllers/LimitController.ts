import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface LimitControllerState {
  pendingTransactions: number
}

type StateKey = keyof LimitControllerState

// -- State --------------------------------------------- //
const state = proxy<LimitControllerState>({
  pendingTransactions: 0
})

// -- Controller ---------------------------------------- //
export const LimitController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: LimitControllerState[K]) => void) {
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
