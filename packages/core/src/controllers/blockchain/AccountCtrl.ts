import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { AccountCtrlState } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const initialState = {
  isConnected: false,
  address: undefined,
  conector: undefined
}

const state = proxy<AccountCtrlState>(initialState)

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: AccountCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchAccount(account => Object.assign(state, account))

    return unwatch
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getAccount())
  },

  disconnect() {
    ClientCtrl.ethereum().disconnect()
  }
}
