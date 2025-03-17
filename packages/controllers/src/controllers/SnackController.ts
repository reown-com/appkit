import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Constants ----------------------------------------- //
const DEFAULT_STATE = Object.freeze<SnackControllerState>({
  message: '',
  variant: 'success',
  svg: undefined,
  open: false,
  autoClose: true
})

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string
  variant: 'error' | 'success' | 'loading'
  svg?: { iconColor: string; icon: string }
  open: boolean
  autoClose: boolean
}

export type SnackControllerShowOptions = {
  autoClose?: boolean
  svg?: SnackControllerState['svg']
  variant?: SnackControllerState['variant']
}

type StateKey = keyof SnackControllerState

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  ...DEFAULT_STATE
})

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SnackControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  showLoading(message: SnackControllerState['message'], options: SnackControllerShowOptions = {}) {
    this._showMessage({ message, variant: 'loading', ...options })
  },

  showSuccess(message: SnackControllerState['message']) {
    this._showMessage({ message, variant: 'success' })
  },

  showSvg(message: SnackControllerState['message'], svg: NonNullable<SnackControllerState['svg']>) {
    this._showMessage({ message, svg })
  },

  showError(message: unknown) {
    const errorMessage = CoreHelperUtil.parseError(message)
    this._showMessage({ message: errorMessage, variant: 'error' })
  },

  hide() {
    state.message = DEFAULT_STATE.message
    state.variant = DEFAULT_STATE.variant
    state.svg = DEFAULT_STATE.svg
    state.open = DEFAULT_STATE.open
    state.autoClose = DEFAULT_STATE.autoClose
  },

  _showMessage({
    message,
    svg,
    variant = 'success',
    autoClose = DEFAULT_STATE.autoClose
  }: { message: string } & SnackControllerShowOptions) {
    if (state.open) {
      state.open = false
      setTimeout(() => {
        state.message = message
        state.variant = variant
        state.svg = svg
        state.open = true
        state.autoClose = autoClose
      }, 150)
    } else {
      state.message = message
      state.variant = variant
      state.svg = svg
      state.open = true
      state.autoClose = autoClose
    }
  }
}
