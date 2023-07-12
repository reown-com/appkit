import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { AccountController } from './AccountController'
import type { RouterControllerState } from './RouterController'
import { RouterController } from './RouterController'

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  open: boolean
}

type StateKey = keyof ModalControllerState

interface OpenOptions {
  view?: RouterControllerState['view']
}

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  open: false
})

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    subscribeKey(state, key, callback)
  },

  open(options?: OpenOptions) {
    if (options?.view) {
      RouterController.reset(options.view)
    } else if (AccountController.state.isConnected) {
      RouterController.reset('Account')
    } else {
      RouterController.reset('Connect')
    }
    state.open = true
  },

  close() {
    state.open = false
  }
}
