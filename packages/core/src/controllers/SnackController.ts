import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string
  variant: 'error' | 'success' | 'loading'
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

  showLoading(message: SnackControllerState['message']) {
    this._showMessage(message, 'loading')
  },

  showSuccess(message: SnackControllerState['message']) {
    this._showMessage(message, 'success')
  },

  showError(message: unknown) {
    const errorMessage = CoreHelperUtil.parseError(message)
    this._showMessage(errorMessage, 'error')
  },

  hide() {
    state.open = false
  },

  _showMessage(message: SnackControllerState['message'], variant: SnackControllerState['variant']) {
    if (state.open) {
      state.open = false
      setTimeout(() => {
        state.message = message
        state.variant = variant
        state.open = true
      }, 150)
    } else {
      state.message = message
      state.variant = variant
      state.open = true
    }
  }
}
