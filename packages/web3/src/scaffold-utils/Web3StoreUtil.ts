// @TODO think about consolidating with packages/scaffold-utils/src/EthersStoreUtil.ts

import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { Address, CombinedProvider, Provider } from './Web3TypesUtil.js'

// -- Types --------------------------------------------- //

export interface Web3StoreUtilState {
  provider?: Provider | CombinedProvider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963' | 'w3mEmail'
  address?: Address
  chainId?: number
  error?: unknown
  isConnected: boolean
}

type StateKey = keyof Web3StoreUtilState

// -- State --------------------------------------------- //
const state = proxy<Web3StoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  isConnected: false
})

// -- StoreUtil ---------------------------------------- //
export const Web3StoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: Web3StoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: Web3StoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: Web3StoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: Web3StoreUtilState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: Web3StoreUtilState['address']) {
    state.address = address
  },

  setChainId(chainId: Web3StoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setIsConnected(isConnected: Web3StoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: Web3StoreUtilState['error']) {
    state.error = error
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.isConnected = false
    state.error = undefined
  }
}
