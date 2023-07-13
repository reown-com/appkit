import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil'
import type { CaipAddress } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean
  caipAddress?: CaipAddress
  address?: string
  balance?: string
  profileName?: string
  profileImage?: string
}

type StateKey = keyof AccountControllerState

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false
})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subscribeKey(state, key, callback)
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress']) {
    state.caipAddress = caipAddress
    state.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(balance: AccountControllerState['balance']) {
    state.balance = balance
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.profileImage = profileImage
  },

  resetAccount() {
    state.isConnected = false
    state.caipAddress = undefined
    state.address = undefined
    state.balance = undefined
    state.profileName = undefined
    state.profileImage = undefined
  }
}
