import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Account } from '../../types/accountTypes'

// -- initial state ------------------------------------------------ //
const initialState = {
  connected: false,
  address: '',
  chainId: '',
  connector: ''
}

const state = proxy<Account>(initialState)

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: Account) => void) {
    return valtioSub(state, () => callback(state))
  },

  setAccount(account: Omit<Account, 'connected'>) {
    Object.assign(state, account)
    state.connected = true
  },

  setAddress(address: Account['address']) {
    state.address = address
  },

  setChainId(chainId: Account['chainId']) {
    state.chainId = chainId
  },

  resetAccount() {
    Object.assign(state, initialState)
  }
}
