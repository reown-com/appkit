import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string
  variant: 'error' | 'success'
  open: boolean
}

type StateKey = keyof SnackControllerState

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  message: '',
  variant: 'success',
  open: false
})

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SnackControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  showSuccess(message: SnackControllerState['message']) {
    state.message = message
    state.variant = 'success'
    state.open = true
  },

  showError(message: unknown) {
    const errorMessage = CoreHelperUtil.parseError(message)
    state.message = errorMessage
    state.variant = 'error'
    state.open = true
  },

  hide() {
    state.open = false
  }
}
