import type UniversalProvider from '@walletconnect/universal-provider'
import { proxy, ref, subscribe } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { ChainNamespace } from '@reown/appkit-common'
import type { ConnectorType } from '@reown/appkit-controllers'

type StateKey = keyof ProviderStoreUtilState

export interface ProviderStoreUtilState {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  providers: Record<ChainNamespace, UniversalProvider | unknown | undefined>
  providerIds: Record<ChainNamespace, ConnectorType | undefined>
}

export type ProviderType =
  | 'walletConnect'
  | 'injected'
  | 'coinbaseWallet'
  | 'eip6963'
  | 'ID_AUTH'
  | 'coinbaseWalletSDK'

const CLEAN_PROVIDERS_STATE = {
  eip155: undefined,
  solana: undefined,
  polkadot: undefined,
  bip122: undefined
}

const state = proxy<ProviderStoreUtilState>({
  providers: { ...CLEAN_PROVIDERS_STATE },
  providerIds: { ...CLEAN_PROVIDERS_STATE }
})

export const ProviderUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ProviderStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribeProviders(callback: (providers: ProviderStoreUtilState['providers']) => void) {
    return subscribe(state.providers, () => callback(state.providers))
  },

  setProvider<T = UniversalProvider>(chainNamespace: ChainNamespace, provider: T) {
    if (provider) {
      state.providers[chainNamespace] = ref(provider) as T
    }
  },

  getProvider<T = UniversalProvider>(chainNamespace: ChainNamespace): T | undefined {
    return state.providers[chainNamespace] as T | undefined
  },

  setProviderId(chainNamespace: ChainNamespace, providerId: ConnectorType) {
    if (providerId) {
      state.providerIds[chainNamespace] = providerId
    }
  },

  getProviderId(chainNamespace: ChainNamespace | undefined): ConnectorType | undefined {
    if (!chainNamespace) {
      return undefined
    }

    return state.providerIds[chainNamespace]
  },

  reset() {
    state.providers = { ...CLEAN_PROVIDERS_STATE }
    state.providerIds = { ...CLEAN_PROVIDERS_STATE }
  },

  resetChain(chainNamespace: ChainNamespace) {
    state.providers[chainNamespace] = undefined
    state.providerIds[chainNamespace] = undefined
  }
}
