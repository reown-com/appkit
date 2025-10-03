import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { W3mFrameTypes } from '@reown/appkit-wallet'

import type { Address, CombinedProvider, Provider } from './EthersTypesUtil.js'

// -- Types --------------------------------------------- //

export type Status = 'reconnecting' | 'connected' | 'disconnected'

export interface EthersStoreUtilState {
  provider?: Provider | CombinedProvider
  providerType?:
    | 'walletConnect'
    | 'injected'
    | 'coinbaseWallet'
    | 'eip6963'
    | 'AUTH'
    | 'coinbaseWalletSDK'
  address?: Address
  chainId?: number
  error?: unknown
  preferredAccountType?: W3mFrameTypes.AccountType
  status: Status
  isConnected: boolean
}

type StateKey = keyof EthersStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<EthersStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  status: 'reconnecting',
  isConnected: false
})

// -- StoreUtil ---------------------------------------- //
export const EthersStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: EthersStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: EthersStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: EthersStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: EthersStoreUtilState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: EthersStoreUtilState['address']) {
    state.address = address
  },

  setPreferredAccountType(preferredAccountType: EthersStoreUtilState['preferredAccountType']) {
    state.preferredAccountType = preferredAccountType
  },

  setChainId(chainId: EthersStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setStatus(status: EthersStoreUtilState['status']) {
    state.status = status
  },

  setIsConnected(isConnected: EthersStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: EthersStoreUtilState['error']) {
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
