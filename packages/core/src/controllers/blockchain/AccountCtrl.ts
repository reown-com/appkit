import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Account } from '../../../types/accountTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const initialState = {
  isConnected: false,
  address: undefined,
  conector: undefined
}

const state = proxy<Account>(initialState)

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: Account) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchAccount(account => Object.assign(state, account))

    return unwatch
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getAccount())
  },

  reset() {
    Object.assign(state, initialState)
  }
}
