import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { AccountController } from './AccountController.js'
import { ApiController } from './ApiController.js'
import { EventsController } from './EventsController.js'
import { PublicStateController } from './PublicStateController.js'
import type { RouterControllerState } from './RouterController.js'
import { RouterController } from './RouterController.js'

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

  subscribeKey<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async open(options?: ModalControllerArguments['open']) {
    await ApiController.state.prefetchPromise

    if (options?.view) {
      RouterController.reset(options.view)
    } else if (AccountController.state.isConnected) {
      RouterController.reset('Account')
    } else {
      RouterController.reset('Connect')
    }
    state.open = true
    PublicStateController.set({ open: true })
    EventsController.sendEvent({ type: 'track', event: 'MODAL_OPEN' })
  },

  close() {
    state.open = false
    PublicStateController.set({ open: false })
    EventsController.sendEvent({ type: 'track', event: 'MODAL_CLOSE' })
  }
}
