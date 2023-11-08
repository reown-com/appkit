import { proxyWithHistory, subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import type { CaipAddress } from '../utils/TypeUtil.js'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean
  caipAddress?: CaipAddress
  address?: string
  balance?: string
  balanceSymbol?: string
  profileName?: string
  profileImage?: string
  addressExplorerUrl?: string
}

type StateKey = keyof AccountControllerState

// -- State --------------------------------------------- //
const state = proxyWithHistory<AccountControllerState>({
  isConnected: false
})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribe(callback: (newState: AccountControllerState) => void) {
    return sub(state, () => callback(state.value))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subKey(state.value, key, callback)
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.value.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress']) {
    state.value.caipAddress = caipAddress
    state.value.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol']
  ) {
    state.value.balance = balance
    state.value.balanceSymbol = balanceSymbol
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.value.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.value.profileImage = profileImage
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl']) {
    state.value.addressExplorerUrl = explorerUrl
  },

  resetAccount() {
    state.value.isConnected = false
    state.value.caipAddress = undefined
    state.value.address = undefined
    state.value.balance = undefined
    state.value.balanceSymbol = undefined
    state.value.profileName = undefined
    state.value.profileImage = undefined
    state.value.addressExplorerUrl = undefined
  }
}
