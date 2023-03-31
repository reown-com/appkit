import { proxy } from 'valtio/vanilla'
import type { ExplorerCtrlState, ListingParams } from '../types/controllerTypes'
import { CoreUtil } from '../utils/CoreUtil'
import { ExplorerUtil } from '../utils/ExplorerUtil'

const isMobile = CoreUtil.isMobile()

// -- initial state ------------------------------------------------ //
const state = proxy<ExplorerCtrlState>({
  wallets: { listings: [], total: 0, page: 1 },
  injectedWallets: [],
  search: { listings: [], total: 0, page: 1 },
  recomendedWallets: []
})

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  async getRecomendedWallets(params: ListingParams) {
    const { listings } = isMobile
      ? await ExplorerUtil.getMobileListings(params)
      : await ExplorerUtil.getDesktopListings(params)
    state.recomendedWallets = Object.values(listings)

    return state.recomendedWallets
  },

  async getWallets(params: ListingParams) {
    const { page, search } = params
    const { listings: listingsObj, total } = isMobile
      ? await ExplorerUtil.getMobileListings(params)
      : await ExplorerUtil.getDesktopListings(params)
    const listings = Object.values(listingsObj)
    const type = search ? 'search' : 'wallets'
    state[type] = {
      listings: [...state[type].listings, ...listings],
      total,
      page: page ?? 1
    }

    return { listings, total }
  },

  async getInjectedWallets() {
    const { listings: listingsObj } = await ExplorerUtil.getInjectedListings({})
    const listings = Object.values(listingsObj)
    state.injectedWallets = listings

    return state.injectedWallets
  },

  getWalletImageUrl(imageId: string) {
    return ExplorerUtil.getWalletImageUrl(imageId)
  },

  getAssetImageUrl(imageId: string) {
    return ExplorerUtil.getAssetImageUrl(imageId)
  },

  resetSearch() {
    state.search = { listings: [], total: 0, page: 1 }
  }
}
