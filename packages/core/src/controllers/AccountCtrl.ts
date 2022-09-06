import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Account } from '../../types/accountTypes'

// -- initial state ------------------------------------------------ //
const initialState = {
  connected: false,
  address: '',
  chainId: ''
}

const state = proxy<Account>(initialState)

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: Account) => void) {
    return valtioSub(state, () => callback(state))
  },

  setAccount(address: Account['address'], chainId: Account['chainId']) {
    state.address = address
    state.chainId = chainId
    state.connected = true
  },

  resetAccount() {
    Object.assign(state, initialState)
  }
}
