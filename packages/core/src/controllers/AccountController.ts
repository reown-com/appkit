import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import type { CaipAddress } from '../utils/TypeUtils.js'

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
const state = proxy<AccountControllerState>({
  isConnected: false
})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribe(callback: (newState: AccountControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress']) {
    state.caipAddress = caipAddress
    state.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol']
  ) {
    state.balance = balance
    state.balanceSymbol = balanceSymbol
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.profileImage = profileImage
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl']) {
    state.addressExplorerUrl = explorerUrl
  },

  resetAccount() {
    state.isConnected = false
    state.caipAddress = undefined
    state.address = undefined
    state.balance = undefined
    state.balanceSymbol = undefined
    state.profileName = undefined
    state.profileImage = undefined
    state.addressExplorerUrl = undefined
  }
}
