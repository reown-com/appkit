import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { OptionsController } from './OptionsController.js'

// -- Types --------------------------------------------- //
export interface AlertControllerState {
  message: string
  variant: 'info' | 'success' | 'warning' | 'error'
  open: boolean
}

type StateKey = keyof AlertControllerState

interface OpenMessageParameters {
  shortMessage: string
  longMessage?: string | (() => void)
}

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

  open(message: OpenMessageParameters, variant: AlertControllerState['variant']) {
    const { debug } = OptionsController.state

    const { shortMessage, longMessage } = message

    if (debug) {
      state.message = shortMessage
      state.variant = variant
      state.open = true
    }

    if (longMessage) {
      // eslint-disable-next-line no-console
      console.error(typeof longMessage === 'function' ? longMessage() : longMessage)
    }
  },

  close() {
    state.open = false
    state.message = ''
    state.variant = 'info'
  }
}
