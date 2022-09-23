import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Account } from '../../types/accountTypes'

// -- initial state ------------------------------------------------ //
const initialAccountlState = {
  isConnected: false,
  address: undefined,
  conector: undefined
}

const state = proxy<Account>(initialAccountlState)

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: Account) => void) {
    return valtioSub(state, () => callback(state))
  },

  setAccount(account: Omit<Account, 'isConnected'>) {
    Object.assign(state, account)
    state.isConnected = true
  },

  setAddress(address: Account['address']) {
    state.address = address
  },

  setConnector(connector: Account['connector']) {
    state.connector = connector
  },

  resetAccount() {
    Object.assign(state, initialAccountlState)
  }
}
