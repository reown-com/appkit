import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface AccountControllerClient {
  getAddress: () => Promise<AccountControllerState['address']>
  getBalance: (
    address: AccountControllerState['address']
  ) => Promise<AccountControllerState['balance']>
  getProfile?: (address: AccountControllerState['address']) => Promise<{
    name: AccountControllerState['profileName']
    image: AccountControllerState['profileImage']
  }>
}

export interface AccountControllerState {
  _client?: AccountControllerClient
  address: string
  balance: string
  profileName?: string
  profileImage?: string
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  _client: undefined,
  address: '',
  balance: ''
})

// -- Controller ---------------------------------------- //
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

  async getBalance(address: AccountControllerState['address']) {
    this.state.balance = await this._getClient().getBalance(address)
  },

  async getProfile(address: AccountControllerState['address']) {
    const profile = await this._getClient().getProfile?.(address)
    this.state.profileName = profile?.name
    this.state.profileImage = profile?.image
  }
}
