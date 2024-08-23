import type { Provider } from '@web3modal/core'
import { proxy, ref } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import type UniversalProvider from '@walletconnect/universal-provider'

type StateKey = keyof ProviderStoreUtilState

export interface ProviderStoreUtilState {
  provider?: Provider | UniversalProvider
  providerId?:
    | 'walletConnect'
    | 'injected'
    | 'coinbaseWallet'
    | 'eip6963'
    | 'w3mAuth'
    | 'coinbaseWalletSDK'
}

const state = proxy<ProviderStoreUtilState>({
  provider: undefined
})

export const ProviderUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ProviderStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  setProvider(provider: ProviderStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderId(providerId: ProviderStoreUtilState['providerId']) {
    if (providerId) {
      state.providerId = providerId
    }
  },

  reset() {
    state.provider = undefined
    state.providerId = undefined
  }
}
