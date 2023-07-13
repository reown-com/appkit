import { subscribeKey } from 'valtio/utils'
import { proxy, ref } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil'

// -- Types --------------------------------------------- //
export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  disconnect: () => Promise<void>
  connectExternal?: (id: string) => Promise<void>
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient
  walletConnectUri?: string
  walletConnectPromise?: Promise<void>
  walletConnectPairingExpiry?: number
}
type StateKey = keyof ConnectionControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({})

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: ConnectionControllerState[K]) => void) {
    return subscribeKey(state, key, callback)
  },

  _getClient() {
    if (!state._client) {
      throw new Error('ConnectionController client not set')
    }

    return state._client
  },

  setClient(client: ConnectionControllerClient) {
    state._client = ref(client)
  },

  connectWalletConnect() {
    state.walletConnectPromise = ref(
      this._getClient().connectWalletConnect(uri => {
        state.walletConnectUri = uri
        state.walletConnectPairingExpiry = CoreHelperUtil.getPairingExpiry()
      })
    )
  },

  async connectExternal(id: string) {
    await this._getClient().connectExternal?.(id)
  },

  async disconnect() {
    await this._getClient().disconnect()
    state.walletConnectUri = ''
  }
}
