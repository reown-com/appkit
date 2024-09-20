import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { AssetUtil } from '../utils/AssetUtil'
import { ApiController } from './ApiController'

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

  setChainImage(key: string, value: string) {
    state.chainImages[key] = value
  },

  setConnectorImage(key: string, value: string) {
    state.connectorImages[key] = value
  },

  setTokenImage(key: string, value: string) {
    state.tokenImages[key] = value
  },

  setCurrencyImage(key: string, value: string) {
    state.currencyImages[key] = value
  },

  getNetworkImage(
    imageSrc: string | undefined,
    imageId: string | undefined
  ): Promise<string | undefined> {
    return new Promise<string | undefined>(async resolve => {
      if (imageSrc) {
        resolve(imageSrc)
        return
      }

      if (imageId) {
        let networkImageBlob = AssetUtil.getNetworkImageById(imageId)

        if (!networkImageBlob) {
          await ApiController._fetchNetworkImage(imageId)
          networkImageBlob = AssetUtil.getNetworkImageById(imageId)
        }

        resolve(networkImageBlob)
        return
      }

      resolve(undefined)
    })
  }
}
