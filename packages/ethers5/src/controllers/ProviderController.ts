import type { ethers } from 'ethers'

import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { Address } from '../utils/types.js'

// -- Types --------------------------------------------- //

export interface ProviderControllerState {
  provider?: ethers.providers.Web3Provider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963'
  address?: Address
  chainId?: number
  isConnected: boolean
}

type StateKey = keyof ProviderControllerState

// -- State --------------------------------------------- //
const state = proxy<ProviderControllerState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  isConnected: false
})

// -- Controller ---------------------------------------- //
export const ProviderController = {
  state,
  subscribeKey<K extends StateKey>(key: K, callback: (value: ProviderControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: ProviderControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: ProviderControllerState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: ProviderControllerState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: ProviderControllerState['address']) {
    state.address = address
  },

  setChainId(chainId: ProviderControllerState['chainId']) {
    state.chainId = chainId
  },

  setIsConnected(isConnected: ProviderControllerState['isConnected']) {
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
