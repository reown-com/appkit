import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { AccountCtrlState } from '../types/controllerTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<AccountCtrlState>({
  address: undefined,
  profileName: undefined,
  profileAvatar: undefined,
  profileLoading: false,
  balanceLoading: false,
  balance: undefined,
  isConnected: false
})

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: AccountCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  getAccount() {
    const account = ClientCtrl.client().getAccount()
    state.address = account.address
    state.isConnected = account.isConnected
  },

  setAddress(address: AccountCtrlState['address']) {
    state.address = address
  },

  setIsConnected(isConnected: AccountCtrlState['isConnected']) {
    state.isConnected = isConnected
  },

  setProfileName(profileName: AccountCtrlState['profileName']) {
    state.profileName = profileName
  },

  setProfileAvatar(profileAvatar: AccountCtrlState['profileAvatar']) {
    state.profileAvatar = profileAvatar
  },

  setProfileLoading(profileLoading: AccountCtrlState['profileLoading']) {
    state.profileLoading = profileLoading
  },

  setBalanceLoading(balanceLoading: AccountCtrlState['balanceLoading']) {
    state.balanceLoading = balanceLoading
  },

  setBalance(balance: AccountCtrlState['balance']) {
    state.balance = balance
  },

  resetProfile() {
    state.profileName = undefined
    state.profileAvatar = undefined
  },

  resetBalance() {
    state.balance = undefined
  },

  resetAccount() {
    state.address = undefined
    state.isConnected = false
    AccountCtrl.resetProfile()
    AccountCtrl.resetBalance()
  }
}
