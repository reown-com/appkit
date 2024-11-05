import { proxy, ref, subscribe } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { ChainNamespace } from '@reown/appkit-common'
import type { ConnectorType } from '@reown/appkit-core'

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
  | 'w3mAuth'
  | 'coinbaseWalletSDK'

const state = proxy<ProviderStoreUtilState>({
  providers: { eip155: undefined, solana: undefined, polkadot: undefined },
  providerIds: { eip155: undefined, solana: undefined, polkadot: undefined }
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

  getProviderId(chainNamespace: ChainNamespace): ConnectorType | undefined {
    return state.providerIds[chainNamespace]
  },

  reset() {
    state.providers = { eip155: undefined, solana: undefined, polkadot: undefined }
    state.providerIds = { eip155: undefined, solana: undefined, polkadot: undefined }
  },

  resetChain(chainNamespace: ChainNamespace) {
    state.providers[chainNamespace] = undefined
    state.providerIds[chainNamespace] = undefined
  }
}
