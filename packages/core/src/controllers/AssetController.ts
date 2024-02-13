import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface AssetControllerState {
  walletImages: Record<string, string>
  networkImages: Record<string, string>
  connectorImages: Record<string, string>
  tokenImages: Record<string, string>
  currencyImages: Record<string, string>
}

type StateKey = keyof AssetControllerState

// -- State --------------------------------------------- //
const state = proxy<AssetControllerState>({
  walletImages: {},
  networkImages: {},
  connectorImages: {},
  tokenImages: {},
  currencyImages: {}
})

// -- Controller ---------------------------------------- //
export const AssetController = {
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

  setConnectorImage(key: string, value: string) {
    state.connectorImages[key] = value
  },

  setTokenImage(key: string, value: string) {
    state.tokenImages[key] = value
  },

  setCurrencyImage(key: string, value: string) {
    state.currencyImages[key] = value
  }
}
