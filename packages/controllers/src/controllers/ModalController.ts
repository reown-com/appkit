import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { ChainNamespace } from '@reown/appkit-common'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { AccountController } from './AccountController.js'
import { ApiController } from './ApiController.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
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
export const ModalController = {
  state,

  subscribe(callback: (newState: ModalControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async open(options?: ModalControllerArguments['open']) {
    const isConnected = AccountController.state.status === 'connected'

    if (ConnectionController.state.wcBasic) {
      // No need to add an await here if we are use basic
      ApiController.prefetch({ fetchNetworkImages: false, fetchConnectorImages: false })
    } else {
      await ApiController.prefetch({
        fetchConnectorImages: !isConnected,
        fetchFeaturedWallets: !isConnected,
        fetchRecommendedWallets: !isConnected
      })
    }

    if (options?.namespace) {
      ConnectorController.setFilterByNamespace(options.namespace)
      await ChainController.switchActiveNamespace(options.namespace)
      ModalController.setLoading(true, options.namespace)
    } else {
      ModalController.setLoading(true)
    }

    const caipAddress = ChainController.getAccountData(options?.namespace)?.caipAddress
    const hasNoAdapters = ChainController.state.noAdapters

    if (hasNoAdapters && !caipAddress) {
      if (CoreHelperUtil.isMobile()) {
        RouterController.reset('AllWallets')
      } else {
        RouterController.reset('ConnectingWalletConnectBasic')
      }
    } else if (options?.view) {
      RouterController.reset(options.view)
    } else if (caipAddress) {
      RouterController.reset('Account')
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

    ConnectorController.clearNamespaceFilter()
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
