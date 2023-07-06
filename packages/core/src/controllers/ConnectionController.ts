import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  disconnect: () => Promise<void>
  connectExternal?: (id: string) => Promise<void>
  connectInjected?: (id: string) => Promise<void>
  connectInjectedLegacy?: () => Promise<void>
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient
  walletConnectUri: string
}

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({
  _client: undefined,
  walletConnectUri: ''
})

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
      this.state.walletConnectUri = uri
    })
  },

  async connectInjected(id: string) {
    await this._getClient().connectInjected?.(id)
  },

  async connectInjectedLegacy() {
    await this._getClient().connectInjectedLegacy?.()
  },

  async connectExternal(id: string) {
    await this._getClient().connectExternal?.(id)
  },

  async disconnect() {
    await this._getClient().disconnect()
    this.state.walletConnectUri = ''
  }
}
