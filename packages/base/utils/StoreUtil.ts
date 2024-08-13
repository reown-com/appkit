import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { W3mFrameTypes } from '@web3modal/wallet'
import UniversalProvider from '@walletconnect/universal-provider'
import type { CaipNetworkId, Chain } from '@web3modal/common'

// -- Types --------------------------------------------- //

export type Status = 'reconnecting' | 'connected' | 'disconnected'

export type Network = {
  id: CaipNetworkId
  imageId: string | undefined
  chainId: string | number
  chain: 'evm' | 'solana'
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
}

export interface WcStoreUtilState {
  provider?: UniversalProvider
  providerType?: 'walletConnect' | 'injected' | 'eip' | 'announced' | 'coinbaseWalletSDK'
  address?: string
  chainId?: number
  caipChainId?: string
  currentChain?: Chain
  currentNetwork?: Network
  error?: unknown
  preferredAccountType?: W3mFrameTypes.AccountType
  status: Status
  isConnected: boolean
  chains: string[]
}

type StateKey = keyof WcStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<WcStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  status: 'reconnecting',
  isConnected: false,
  chains: []
})

// -- StoreUtil ---------------------------------------- //
export const WcStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: WcStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: WcStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setAddress(address: WcStoreUtilState['address']) {
    state.address = address
  },

  setError(error: WcStoreUtilState['error']) {
    state.error = error
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.status = 'disconnected'
    state.isConnected = false
    state.error = undefined
    state.currentChain = undefined
    state.currentNetwork = undefined
    state.caipChainId = undefined
    state.chains = []
    state.preferredAccountType = undefined
  }
}
