// -- Types --------------------------------------------- //

import type { CombinedProvider } from '@web3modal/core'
import type { Provider } from '@web3modal/scaffold-utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subkey } from 'valtio/vanilla/utils'

export interface EthersStoreUtilState {
  provider?: Provider | CombinedProvider
  providerId?:
    | 'walletConnect'
    | 'injected'
    | 'coinbaseWallet'
    | 'eip6963'
    | 'w3mAuth'
    | 'coinbaseWalletSDK'
}

type StateKey = keyof EthersStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<EthersStoreUtilState>({
  provider: undefined,
  providerId: undefined
})

// -- StoreUtil ---------------------------------------- //
export const EthersStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: EthersStoreUtilState[K]) => void) {
    return subkey(state, key, callback)
  },

  subscribe(callback: (newState: EthersStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: EthersStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderId(providerId: EthersStoreUtilState['providerId']) {
    state.providerId = providerId
  },

  reset() {
    state.provider = undefined
    state.providerId = undefined
  }
}
