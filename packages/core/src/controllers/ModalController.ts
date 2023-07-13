import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { AccountController } from './AccountController'
import type { RouterControllerState } from './RouterController'
import { RouterController } from './RouterController'

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  open: boolean
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view']
  }
}

type StateKey = keyof ModalControllerState

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  open: false
})

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    return subscribeKey(state, key, callback)
  },

  open(options?: ModalControllerArguments['open']) {
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
