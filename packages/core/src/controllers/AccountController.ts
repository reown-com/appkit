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
    subscribeKey(state, key, callback)
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    this.state.isConnected = isConnected
  },

  setAddress(caipAddress: AccountControllerState['caipAddress']) {
    this.state.caipAddress = caipAddress
    this.state.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(balance: AccountControllerState['balance']) {
    this.state.balance = balance
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    this.state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    this.state.profileImage = profileImage
  },

  resetAccount() {
    this.state = { isConnected: false }
  }
}
