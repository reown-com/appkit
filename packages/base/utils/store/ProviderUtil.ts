import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import type UniversalProvider from '@walletconnect/universal-provider'

type StateKey = keyof ProviderStoreUtilState

export interface ProviderStoreUtilState {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  provider?: UniversalProvider | unknown | undefined
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

  setProvider<T = UniversalProvider>(provider: T) {
    if (provider) {
      state.provider = provider as T
    }
  },

  getProvider<T = UniversalProvider>(): T {
    return state.provider as T
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
