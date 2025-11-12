import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace } from '@reown/appkit-common'

import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ApiController } from './ApiController.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { EventsController } from './EventsController.js'
import { OptionsController } from './OptionsController.js'
import { PublicStateController } from './PublicStateController.js'
import type { RouterControllerState } from './RouterController.js'
import { RouterController } from './RouterController.js'

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  loading: boolean
  loadingNamespaceMap: Map<ChainNamespace, boolean>
  open: boolean
  shake: boolean
  namespace: ChainNamespace | undefined
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view']
    namespace?: ChainNamespace
    data?: RouterControllerState['data']
  }
}

type StateKey = keyof ModalControllerState

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  loading: false,
  loadingNamespaceMap: new Map<ChainNamespace, boolean>(),
  open: false,
  shake: false,
  namespace: undefined
})

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (newState: ModalControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async open(_options?: ModalControllerArguments['open']) {
    await ApiController.prefetch()
    RouterController.push(_options?.view || 'Transfers')
    state.open = true
    PublicStateController.set({ open: true })
  },

  close() {
    const isEmbeddedEnabled = OptionsController.state.enableEmbedded
    const isConnected = Boolean(ChainController.state.activeCaipAddress)

    // Only send the event if the modal is open and is about to be closed
    if (state.open) {
      EventsController.sendEvent({
        type: 'track',
        event: 'MODAL_CLOSE',
        properties: { connected: isConnected }
      })
    }

    state.open = false
    RouterController.reset('Connect')
    ModalController.clearLoading()

    if (isEmbeddedEnabled) {
      if (isConnected) {
        RouterController.replace('Account')
      } else {
        RouterController.push('Connect')
      }
    } else {
      PublicStateController.set({ open: false })
    }

    ConnectionController.resetUri()
  },

  setLoading(loading: ModalControllerState['loading'], namespace?: ChainNamespace) {
    if (namespace) {
      state.loadingNamespaceMap.set(namespace, loading)
    }
    state.loading = loading
    PublicStateController.set({ loading })
  },

  clearLoading() {
    state.loadingNamespaceMap.clear()
    state.loading = false
    PublicStateController.set({ loading: false })
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

// Export the controller wrapped with our error boundary
export const ModalController = withErrorBoundary(controller)
