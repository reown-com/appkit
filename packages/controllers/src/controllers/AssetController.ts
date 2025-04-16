import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { withErrorBoundary } from '../utils/withErrorBoundary.js'

// -- Types --------------------------------------------- //
export interface AssetControllerState {
  walletImages: Record<string, string>
  networkImages: Record<string, string>
  chainImages: Record<string, string>
  connectorImages: Record<string, string>
  tokenImages: Record<string, string>
  currencyImages: Record<string, string>
}

type StateKey = keyof AssetControllerState

// -- State --------------------------------------------- //
const state = proxy<AssetControllerState>({
  walletImages: {},
  networkImages: {},
  chainImages: {},
  connectorImages: {},
  tokenImages: {},
  currencyImages: {}
})

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribeNetworkImages(callback: (value: AssetControllerState['networkImages']) => void) {
    return sub(state.networkImages, () => callback(state.networkImages))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: AssetControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: AssetControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setWalletImage(key: string, value: string) {
    state.walletImages[key] = value
  },

  setNetworkImage(key: string, value: string) {
    state.networkImages[key] = value
  },

  setChainImage(key: string, value: string) {
    state.chainImages[key] = value
  },

  setConnectorImage(key: string, value: string) {
    state.connectorImages = { ...state.connectorImages, [key]: value }
  },

  setTokenImage(key: string, value: string) {
    state.tokenImages[key] = value
  },

  setCurrencyImage(key: string, value: string) {
    state.currencyImages[key] = value
  }
}

// Export the controller wrapped with our error boundary
export const AssetController = withErrorBoundary(controller)
