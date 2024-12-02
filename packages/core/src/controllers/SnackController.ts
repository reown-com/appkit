import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string
  variant: 'error' | 'success' | 'loading'
  svg?: { iconColor: string; icon: string }
  open: boolean
}

type StateKey = keyof SnackControllerState

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  message: '',
  variant: 'success',
  svg: undefined,
  open: false
})

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SnackControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  showLoading(message: SnackControllerState['message']) {
    this._showMessage({ message, variant: 'loading' })
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
    state.open = false
  },

  _showMessage({
    message,
    svg,
    variant = 'success'
  }: {
    message: SnackControllerState['message']
    svg?: SnackControllerState['svg']
    variant?: SnackControllerState['variant']
  }) {
    if (state.open) {
      state.open = false
      setTimeout(() => {
        state.message = message
        state.variant = variant
        state.svg = svg
        state.open = true
      }, 150)
    } else {
      state.message = message
      state.variant = variant
      state.svg = svg
      state.open = true
    }
  }
}
