import type { ethers } from 'ethers'

import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { Address } from '../utils/types.js'

// -- Types --------------------------------------------- //

interface EIP6963Provider {
  name: string
  provider: ethers.providers.Web3Provider
}
export interface ProviderControllerState {
  provider?: ethers.providers.Web3Provider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963'
  address?: Address
  chainId?: number
  isConnected: boolean
  EIP6963Providers: EIP6963Provider[]
}

type StateKey = keyof ProviderControllerState

// -- State --------------------------------------------- //
const state = proxy<ProviderControllerState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  isConnected: false,
  EIP6963Providers: []
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

  add6963Provider(provider: EIP6963Provider) {
    state.EIP6963Providers.push(provider)
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.isConnected = false
  }
}
