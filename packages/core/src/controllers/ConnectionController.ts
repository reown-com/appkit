import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type { WcWallet } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  disconnect: () => Promise<void>
  connectExternal?: (id: string) => Promise<void>
  checkInjectedInstalled?: (ids?: string[]) => boolean
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient
  wcUri?: string
  wcPromise?: Promise<void>
  wcPairingExpiry?: number
  wcLinking?: {
    href: string
    name: string
  }
  wcError?: boolean
  recentWallet?: WcWallet
  buffering: boolean
}

type StateKey = keyof ConnectionControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({
  wcError: false,
  buffering: false
})

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

  checkInjectedInstalled(ids?: string[]) {
    return this._getClient().checkInjectedInstalled?.(ids)
  },

  resetWcConnection() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    state.wcPromise = undefined
    state.wcLinking = undefined
    state.recentWallet = undefined
    StorageUtil.deleteWalletConnectDeepLink()
  },

  setWcLinking(wcLinking: ConnectionControllerState['wcLinking']) {
    state.wcLinking = wcLinking
  },

  setWcError(wcError: ConnectionControllerState['wcError']) {
    state.wcError = wcError
    state.buffering = false
  },

  setRecentWallet(wallet: ConnectionControllerState['recentWallet']) {
    state.recentWallet = wallet
  },

  setBuffering(buffering: ConnectionControllerState['buffering']) {
    state.buffering = buffering
  },

  async disconnect() {
    await this._getClient().disconnect()
    this.resetWcConnection()
  }
}
