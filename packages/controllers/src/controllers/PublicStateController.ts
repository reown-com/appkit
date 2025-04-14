import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey } from 'valtio/vanilla/utils'

import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'

// -- Types --------------------------------------------- //
export interface PublicStateControllerState {
  /**
   * @description Indicates if the AppKit is loading.
   * @type {boolean}
   */
  loading: boolean
  /**
   * @description Indicates if the AppKit modal is open.
   * @type {boolean}
   */
  open: boolean
  /**
   * @description Indicates the selected network id in CAIP-2 format.
   * @type {CaipNetworkId | undefined}
   */
  selectedNetworkId?: CaipNetworkId | undefined
  /**
   * @description Indicates the active chain namespace.
   * @type {ChainNamespace | undefined}
   */
  activeChain?: ChainNamespace | undefined
  /**
   * @description Indicates if the AppKit has been initialized. This sets to true when all controllers, adapters and internal state is ready.
   * @type {boolean}
   */
  initialized: boolean
}

// -- State --------------------------------------------- //
const state = proxy<PublicStateControllerState>({
  loading: false,
  open: false,
  selectedNetworkId: undefined,
  activeChain: undefined,
  initialized: false
})

// -- Controller ---------------------------------------- //
export const PublicStateController = {
  state,

  subscribe(callback: (newState: PublicStateControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeOpen(callback: (newState: PublicStateControllerState['open']) => void) {
    return subscribeKey(state, 'open', callback)
  },

  set(newState: Partial<PublicStateControllerState>) {
    Object.assign(state, { ...state, ...newState })
  }
}
