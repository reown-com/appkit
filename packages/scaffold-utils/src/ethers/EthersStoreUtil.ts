import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { Address, Provider } from './EthersTypesUtil.js'
import type { W3mFrameProvider } from '@web3modal/smart-account'
// -- Types --------------------------------------------- //

export interface EthersStoreUtilState {
  provider?: Provider | W3mFrameProvider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963' | 'w3mEmail'
  address?: Address
  chainId?: number
  isConnected: boolean
}

type StateKey = keyof EthersStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<EthersStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
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

  setChainId(chainId: EthersStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setIsConnected(isConnected: EthersStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.isConnected = false
  }
}
