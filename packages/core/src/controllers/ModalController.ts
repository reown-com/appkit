import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { ApiController } from './ApiController.js'
import { EventsController } from './EventsController.js'
import { PublicStateController } from './PublicStateController.js'
import type { RouterControllerState } from './RouterController.js'
import { RouterController } from './RouterController.js'
import { ChainController } from './ChainController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  loading: boolean
  open: boolean
  shake: boolean
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view']
  }
}

type StateKey = keyof ModalControllerState

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  loading: false,
  open: false,
  shake: false
})

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  subscribe(callback: (newState: ModalControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async open(options?: ModalControllerArguments['open']) {
    await ApiController.state.prefetchPromise
    const caipAddress = ChainController.state.activeCaipAddress

    const noAdapters = ChainController.state.noAdapters

    if (options?.view) {
      RouterController.reset(options.view)
    } else if (caipAddress) {
      RouterController.reset('Account')
    } else if (noAdapters && !CoreHelperUtil.isMobile()) {
      RouterController.reset('ConnectingWalletConnect')
    } else {
      RouterController.reset('Connect')
    }
    state.open = true
    PublicStateController.set({ open: true })
    EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_OPEN',
      properties: { connected: Boolean(caipAddress) }
    })
  },

  close() {
    const connected = Boolean(ChainController.state.activeCaipAddress)
    state.open = false
    PublicStateController.set({ open: false })
    EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_CLOSE',
      properties: { connected }
    })
  },

  setLoading(loading: ModalControllerState['loading']) {
    state.loading = loading
    PublicStateController.set({ loading })
  },

  shake() {
    if (state.shake) {
      return
    }
    state.shake = true
    setTimeout(() => {
      state.shake = false
    }, 500)
  }
}
