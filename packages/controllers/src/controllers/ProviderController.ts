import type UniversalProvider from '@walletconnect/universal-provider'
import { proxy, ref, subscribe } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { ChainNamespace } from '@reown/appkit-common'

import type { ConnectorType } from '../utils/TypeUtil.js'
import type { ChainControllerState } from './ChainController.js'

export interface ProviderControllerState {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  providers: Record<ChainNamespace, UniversalProvider | unknown | undefined>
  providerIds: Record<ChainNamespace, ConnectorType | undefined>
}

type StateKey = keyof ProviderControllerState

export type ProviderType =
  | 'walletConnect'
  | 'injected'
  | 'coinbaseWallet'
  | 'eip6963'
  | 'AUTH'
  | 'coinbaseWalletSDK'
  | 'baseAccount'

const CLEAN_PROVIDERS_STATE = {
  eip155: undefined,
  solana: undefined,
  polkadot: undefined,
  bip122: undefined,
  cosmos: undefined,
  sui: undefined,
  stacks: undefined,
  ton: undefined
}

const state = proxy<ProviderControllerState>({
  providers: { ...CLEAN_PROVIDERS_STATE },
  providerIds: { ...CLEAN_PROVIDERS_STATE }
})

export const ProviderController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ProviderControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (value: ProviderControllerState) => void) {
    return subscribe(state, () => {
      callback(state)
    })
  },

  subscribeProviders(callback: (providers: ProviderControllerState['providers']) => void) {
    return subscribe(state.providers, () => callback(state.providers))
  },

  setProvider<T = UniversalProvider>(
    chainNamespace: ChainControllerState['activeChain'],
    provider: T
  ) {
    if (chainNamespace && provider) {
      state.providers[chainNamespace] = ref(provider) as T
    }
  },

  getProvider<T = UniversalProvider>(
    chainNamespace: ChainControllerState['activeChain']
  ): T | undefined {
    if (!chainNamespace) {
      return undefined
    }

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
