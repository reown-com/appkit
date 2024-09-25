import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import { OptionsController } from './OptionsController.js'

// -- Types --------------------------------------------- //
export interface AlertControllerState {
  message: string
  variant: 'info' | 'success' | 'warning' | 'error'
  open: boolean
}

type StateKey = keyof AlertControllerState

// -- State --------------------------------------------- //
const state = proxy<AlertControllerState>({
  message: '',
  variant: 'info',
  open: false
})

// -- Controller ---------------------------------------- //
export const AlertController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: AlertControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  open(message: AlertControllerState['message'], variant: AlertControllerState['variant']) {
    const { debug } = OptionsController.state

    if (debug) {
      state.message = message
      state.variant = variant
      state.open = true
    }
  },

  close() {
    state.open = false
    state.message = ''
    state.variant = 'info'
  }
}
