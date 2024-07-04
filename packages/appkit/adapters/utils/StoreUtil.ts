import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import UniversalProvider from '@walletconnect/universal-provider'
import EthereumProvider from '@walletconnect/ethereum-provider'
import type { CombinedProvider, Provider, Status } from './TypesUtil.js'
import type { W3mFrameTypes } from '@web3modal/wallet'

type StateKey = keyof AppKitStoreUtilState

export interface AppKitStoreUtilState {
  provider?: Provider | CombinedProvider | EthereumProvider | UniversalProvider
  providerType?:
    | 'walletConnect_ethereum'
    | 'walletConnect_universal'
    | 'injected'
    | `injected_${string}`
    | 'coinbaseWallet'
    | 'eip6963'
    | 'w3mAuth'
    | 'coinbaseWalletSDK'
  address?: string
  chainId?: string
  currentChain?: 'evm' | 'solana'
  requestId?: number
  error?: unknown
  preferredAccountType?: W3mFrameTypes.AccountType
  status: Status
  isConnected: boolean
}

const state = proxy<AppKitStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  currentChain: undefined,
  chainId: undefined,
  status: 'disconnected',
  isConnected: false
})

export const AppKitStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: AppKitStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: AppKitStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: AppKitStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: AppKitStoreUtilState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: AppKitStoreUtilState['chainId']) {
    state.address = address
  },

  setChainId(chainId: AppKitStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setCurrentChain(currentChain: AppKitStoreUtilState['currentChain']) {
    state.currentChain = currentChain
  },

  setRequestId(requestId: AppKitStoreUtilState['requestId']) {
    state.requestId = requestId
  },

  setError(error: AppKitStoreUtilState['error']) {
    state.error = error
  },

  setPrefferedAccountType(preferredAccountType: AppKitStoreUtilState['preferredAccountType']) {
    state.preferredAccountType = preferredAccountType
  },

  setStatus(status: AppKitStoreUtilState['status']) {
    state.status = status
  },

  setIsConnected(isConnected: AppKitStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  reset() {
    state.provider = undefined
    state.providerType = undefined
    state.address = undefined
    state.chainId = undefined
    state.currentChain = undefined
    state.requestId = undefined
    state.error = undefined
    state.preferredAccountType = undefined
    state.status = 'disconnected'
    state.isConnected = false
  }
}
