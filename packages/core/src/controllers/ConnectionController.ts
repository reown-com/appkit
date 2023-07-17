import { subscribeKey as subKey } from 'valtio/utils'
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
  wcUri?: string
  wcPromise?: Promise<void>
  wcPairingExpiry?: number
}
type StateKey = keyof ConnectionControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({})

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ConnectionControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
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
    state.wcPromise = this._getClient().connectWalletConnect(uri => {
      state.wcUri = uri
      state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry()
    })
  },

  async connectExternal(id: string) {
    await this._getClient().connectExternal?.(id)
  },

  resetWcConnection() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    state.wcPromise = undefined
  },

  async disconnect() {
    await this._getClient().disconnect()
    this.resetWcConnection()
  }
}
