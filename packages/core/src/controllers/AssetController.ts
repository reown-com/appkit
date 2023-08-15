import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { CaipNetworkId } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
export interface AssetControllerState {
  walletImages: Record<string, string>
  networkImages: Record<CaipNetworkId, string>
  connectorImages: Record<string, string>
  tokenImages: Record<string, string>
}

type StateKey = keyof AssetControllerState

// -- State --------------------------------------------- //
const state = proxy<AssetControllerState>({
  walletImages: {},
  networkImages: {},
  connectorImages: {},
  tokenImages: {}
})

// -- Controller ---------------------------------------- //
export const AssetController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: AssetControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setWalletImage(key: string, value: string) {
    state.walletImages[key] = value
  },

  setNetworkImage(key: CaipNetworkId, value: string) {
    state.networkImages[key] = value
  },

  setConnectorImage(key: string, value: string) {
    state.connectorImages[key] = value
  },

  setTokenImage(key: string, value: string) {
    state.tokenImages[key] = value
  }
}
