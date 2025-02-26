import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { ApiController } from './ApiController.js'
import { ChainController } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { OptionsController } from './OptionsController.js'
import { PublicStateController } from './PublicStateController.js'
import type { RouterControllerState } from './RouterController.js'
import { RouterController } from './RouterController.js'

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
export const modalState = proxy<ModalControllerState>({
  loading: false,
  open: false,
  shake: false
})

export function subscribeModal(callback: (newState: ModalControllerState) => void) {
  return sub(modalState, () => callback(modalState))
}

export function subscribeModalKey<K extends StateKey>(
  key: K,
  callback: (value: ModalControllerState[K]) => void
) {
  return subKey(modalState, key, callback)
}

export async function openModal(options?: ModalControllerArguments['open']) {
  await ApiController.prefetch()
  const caipAddress = ChainController.state.activeCaipAddress

  const noAdapters = ChainController.state.noAdapters

  if (options?.view) {
    RouterController.reset(options.view)
  } else if (caipAddress) {
    RouterController.reset('Account')
  } else if (noAdapters && !CoreHelperUtil.isMobile()) {
    RouterController.reset('ConnectingWalletConnectBasic')
  } else {
    RouterController.reset('Connect')
  }
  modalState.open = true
  PublicStateController.set({ open: true })
  EventsController.sendEvent({
    type: 'track',
    event: 'MODAL_OPEN',
    properties: { connected: Boolean(caipAddress) }
  })
}

export function closeModal() {
  const isEmbeddedEnabled = OptionsController.state.enableEmbedded
  const connected = Boolean(ChainController.state.activeCaipAddress)

  modalState.open = false

  if (isEmbeddedEnabled) {
    if (connected) {
      RouterController.replace('Account')
    } else {
      RouterController.push('Connect')
    }
  } else {
    PublicStateController.set({ open: false })
  }

  EventsController.sendEvent({
    type: 'track',
    event: 'MODAL_CLOSE',
    properties: { connected }
  })

  ConnectorController.clearNamespaceFilter()
}

export function setModalLoading(loading: ModalControllerState['loading']) {
  modalState.loading = loading
  PublicStateController.set({ loading })
}

export function shakeModal() {
  if (modalState.shake) {
    return
  }
  modalState.shake = true
  setTimeout(() => {
    modalState.shake = false
  }, 500)
}
