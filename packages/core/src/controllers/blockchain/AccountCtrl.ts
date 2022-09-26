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
    return ClientCtrl.ethereum().watchAccount(account => Object.assign(state, account))
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getAccount())
  },

  reset() {
    Object.assign(state, initialState)
  }
}
