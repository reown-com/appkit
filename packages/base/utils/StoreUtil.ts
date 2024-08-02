import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { W3mFrameTypes } from '@web3modal/wallet'
import UniversalProvider from '@walletconnect/universal-provider'
// -- Types --------------------------------------------- //

export type Status = 'reconnecting' | 'connected' | 'disconnected'

export interface WcStoreUtilState {
  provider?: UniversalProvider
  providerType?: 'walletConnect'
  address?: string
  chainId?: number
  error?: unknown
  preferredAccountType?: W3mFrameTypes.AccountType
  status: Status
  isConnected: boolean
}

type StateKey = keyof WcStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<WcStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  status: 'reconnecting',
  isConnected: false
})

// -- StoreUtil ---------------------------------------- //
export const WcStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: WcStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: WcStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: WcStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: WcStoreUtilState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: WcStoreUtilState['address']) {
    state.address = address
  },

  setPreferredAccountType(preferredAccountType: WcStoreUtilState['preferredAccountType']) {
    state.preferredAccountType = preferredAccountType
  },

  setChainId(chainId: WcStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setStatus(status: WcStoreUtilState['status']) {
    state.status = status
  },

  setIsConnected(isConnected: WcStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: WcStoreUtilState['error']) {
    state.error = error
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.status = 'disconnected'
    state.isConnected = false
    state.error = undefined
    state.preferredAccountType = undefined
  }
}
