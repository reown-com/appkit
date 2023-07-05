import { proxy, ref } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  connectBrowserExtension: (id: string) => Promise<void>
  disconnect: () => Promise<void>
  connectThirdPartyWallet?: (id: string) => Promise<void>
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

  async connectBrowserExtension(id: string) {
    await this._getClient().connectBrowserExtension(id)
  },

  async connectThirdPartyWallet(id: string) {
    await this._getClient().connectThirdPartyWallet?.(id)
  },

  async disconnect() {
    await this._getClient().disconnect()
    this.state.walletConnectUri = ''
  }
}
