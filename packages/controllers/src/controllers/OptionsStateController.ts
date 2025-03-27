import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

// -- Types --------------------------------------------- //
export interface OptionsStateControllerState {
  isLegalCheckboxChecked: boolean
}

type StateKey = keyof OptionsStateControllerState

// -- State --------------------------------------------- //
const state = proxy<OptionsStateControllerState>({
  isLegalCheckboxChecked: false
})

// -- Controller ---------------------------------------- //
export const OptionsStateController = {
  state,

  subscribe(callback: (newState: OptionsStateControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: OptionsStateControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  setIsLegalCheckboxChecked(isLegalCheckboxChecked: boolean) {
    state.isLegalCheckboxChecked = isLegalCheckboxChecked
  }
}
