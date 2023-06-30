import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface AccountControllerClient {
  getAddress: () => Promise<AccountControllerState['address']>
  getBalance: () => Promise<AccountControllerState['balance']>
  getProfileName?: () => Promise<AccountControllerState['profileName']>
  getProfileImage?: () => Promise<AccountControllerState['profileImage']>
}

export interface AccountControllerState {
  _client?: AccountControllerClient
  address: string
  balance: string
  profileName?: string
  profileImage?: string
}

// -- State --------------------------------------------------------------------
const state = proxy<AccountControllerState>({
  _client: undefined,
  address: '',
  balance: ''
})

// -- Controller ---------------------------------------------------------------
export const AccountController = {
  state,

  _getClient() {
    if (!state._client) {
      throw new Error('AccountController client not set')
    }

    return state._client
  },

  setClient(client: AccountControllerClient) {
    state._client = ref(client)
  },

  async getAddress() {
    this.state.address = await this._getClient().getAddress()
  },

  async getBalance() {
    this.state.balance = await this._getClient().getBalance()
  },

  async getProfileName() {
    this.state.profileName = await this._getClient().getProfileName?.()
  },

  async getProfileImage() {
    this.state.profileImage = await this._getClient().getProfileImage?.()
  }
}
