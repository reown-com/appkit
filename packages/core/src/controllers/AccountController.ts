import { proxy } from 'valtio/vanilla'
import type { CaipAddress } from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  address?: CaipAddress
  balance?: string
  profileName?: string
  profileImage?: string
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

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
