import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { OptionsController } from '@web3modal/core'

import type { Chain, Provider, Connection } from './SolanaTypesUtil.js'
import { SolConstantsUtil } from './SolanaConstantsUtil.js'
import { SolHelpersUtil } from './SolanaHelpersUtils.js'
import type { Network } from '../../../../../utils/StoreUtil.js'

type StateKey = keyof SolStoreUtilState

export interface SolStoreUtilState {
  provider?: Provider
  address?: string
  chainId?: string
  caipChainId?: string
  currentChain?: Network
  requestId?: number
  error?: unknown
  connection: Connection | null
  isConnected: boolean
}

const state = proxy<SolStoreUtilState>({
  provider: undefined,
  address: undefined,
  currentChain: undefined,
  chainId: undefined,
  caipChainId: undefined,
  connection: null,
  isConnected: false
})

export const SolStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SolStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SolStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: SolStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setAddress(address: string) {
    state.address = address
  },

  setConnection(connection: Connection) {
    state.connection = ref(connection)
  },

  setCaipChainId(caipChainId: SolStoreUtilState['caipChainId']) {
    state.caipChainId = caipChainId
  },

  setIsConnected(isConnected: SolStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: SolStoreUtilState['error']) {
    state.error = error
  },

  getCluster() {
    const chain = state.currentChain ?? (SolConstantsUtil.DEFAULT_CHAIN as Network)

    return {
      name: chain.name,
      id: chain.chainId,
      endpoint: SolHelpersUtil.detectRpcUrl(chain, OptionsController.state.projectId)
    }
  },

  getNewRequestId() {
    const curId = state.requestId ?? 0
    state.requestId = curId + 1

    return state.requestId
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.isConnected = false
    state.error = undefined
  }
}
