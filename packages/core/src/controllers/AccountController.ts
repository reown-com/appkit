import { proxy } from 'valtio/vanilla'
import type { CaipAddress } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean
  address?: CaipAddress
  balance?: string
  profileName?: string
  profileImage?: string
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false
})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    this.state.isConnected = isConnected
  },

  setAddress(address: AccountControllerState['address']) {
    this.state.address = address
  },

  setBalance(balance: AccountControllerState['balance']) {
    this.state.balance = balance
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    this.state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    this.state.profileImage = profileImage
  }
}
