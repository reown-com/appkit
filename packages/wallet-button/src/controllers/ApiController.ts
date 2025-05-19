import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type ApiGetWalletsResponse,
  ApiController as CoreApiController,
  CoreHelperUtil,
  FetchUtil,
  type WcWallet
} from '@reown/appkit-controllers'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getApiUrl()
export const api = new FetchUtil({
  baseUrl,
  clientId: null
})

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  walletButtons: WcWallet[]
  fetching: boolean
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  walletButtons: [],
  fetching: false
})

// -- Controller ---------------------------------------- //
export const ApiController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async fetchWalletButtons() {
    if (state.fetching) {
      return
    }
    state.fetching = true
    const walletButtonIds = Object.values(ConstantsUtil.WalletButtonsIds)
    const { data } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      params: {
        ...CoreApiController._getSdkProperties(),
        page: '1',
        entries: String(walletButtonIds.length),
        include: walletButtonIds?.join(',')
      }
    })
    const images = data.map(d => d.image_id).filter(Boolean)
    await Promise.allSettled(
      (images as string[]).map(id => CoreApiController._fetchWalletImage(id))
    )
    state.walletButtons = data
  }
}
