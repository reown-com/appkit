import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Constants ----------------------------------------- //
const DEFAULT_DURATION_MS = 2500

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string
  variant: 'error' | 'success' | 'loading'
  open: boolean
  durationMs: number
}

type StateKey = keyof SnackControllerState

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  message: '',
  variant: 'success',
  open: false,
  durationMs: DEFAULT_DURATION_MS
})

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SnackControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  showLoading(
    message: SnackControllerState['message'],
    durationMs?: SnackControllerState['durationMs']
  ) {
    this._showMessage(message, 'loading', durationMs)
  },

  showSuccess(
    message: SnackControllerState['message'],
    durationMs?: SnackControllerState['durationMs']
  ) {
    this._showMessage(message, 'success', durationMs)
  },

  showError(message: unknown, durationMs?: SnackControllerState['durationMs']) {
    const errorMessage = CoreHelperUtil.parseError(message)
    this._showMessage(errorMessage, 'error', durationMs)
  },

  hide() {
    state.open = false
  },

  _showMessage(
    message: SnackControllerState['message'],
    variant: SnackControllerState['variant'],
    durationMs?: SnackControllerState['durationMs']
  ) {
    if (state.open) {
      state.open = false
      setTimeout(() => {
        state.message = message
        state.variant = variant
        state.open = true
        state.durationMs = durationMs || DEFAULT_DURATION_MS
      }, 150)
    } else {
      state.message = message
      state.variant = variant
      state.open = true
    }
  }
}
