import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  disconnect: () => Promise<void>
  connectExternal?: (id: string) => Promise<void>
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient
  walletConnectUri?: string
}

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({})

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

  _getClient() {
    if (!state._client) {
      throw new Error('ConnectionController client not set')
    }

    return state._client
  },

  setClient(client: ConnectionControllerClient) {
    state._client = ref(client)
  },

  async connectWalletConnect() {
    await this._getClient().connectWalletConnect(uri => {
      state.walletConnectUri = uri
    })
  },

  async connectExternal(id: string) {
    await this._getClient().connectExternal?.(id)
  },

  async disconnect() {
    await this._getClient().disconnect()
    state.walletConnectUri = ''
  }
}
