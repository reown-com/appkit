import { proxy } from 'valtio/vanilla'
import type { ExplorerCtrlState, ListingParams } from '../types/controllerTypes'
import { CoreUtil } from '../utils/CoreUtil'
import { ExplorerUtil } from '../utils/ExplorerUtil'
import { ConfigCtrl } from './ConfigCtrl'

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

  async getRecomendedWallets() {
    const { explorerRecommendedWalletIds, explorerExcludedWalletIds } = ConfigCtrl.state

    // Don't fetch recomended wallets
    if (
      explorerRecommendedWalletIds === 'NONE' ||
      (explorerExcludedWalletIds === 'ALL' && !explorerRecommendedWalletIds)
    ) {
      return state.recomendedWallets
    }

    // Fetch only recomended wallets defined in config
    if (CoreUtil.isArray(explorerRecommendedWalletIds)) {
      const recommendedIds = explorerRecommendedWalletIds.join(',')
      const params = { recommendedIds }
      const { listings } = await ExplorerUtil.getAllListings(params)
      const listingsArr = Object.values(listings)
      listingsArr.sort((a, b) => {
        const aIndex = explorerRecommendedWalletIds.indexOf(a.id)
        const bIndex = explorerRecommendedWalletIds.indexOf(b.id)

        return aIndex - bIndex
      })
      state.recomendedWallets = listingsArr
    }

    // Fetch default recomended wallets based on user's device, options and excluded config
    else {
      const isExcluded = CoreUtil.isArray(explorerExcludedWalletIds)
      const params = {
        page: 1,
        entries: CoreUtil.RECOMMENDED_WALLET_AMOUNT,
        version: 2,
        excludedIds: isExcluded ? explorerExcludedWalletIds.join(',') : undefined
      }
      const { listings } = isMobile
        ? await ExplorerUtil.getMobileListings(params)
        : await ExplorerUtil.getDesktopListings(params)
      state.recomendedWallets = Object.values(listings)
    }

    return state.recomendedWallets
  },

  async getWallets(params: ListingParams) {
    const extendedParams: ListingParams = { ...params }
    const { explorerRecommendedWalletIds, explorerExcludedWalletIds } = ConfigCtrl.state
    const { recomendedWallets } = state

    // Don't fetch any wallets if all are excluded
    if (explorerExcludedWalletIds === 'ALL') {
      return state.wallets
    }

    // Don't fetch recomended wallets, as we already have these
    if (recomendedWallets.length) {
      extendedParams.excludedIds = recomendedWallets.map(wallet => wallet.id).join(',')
    } else if (CoreUtil.isArray(explorerRecommendedWalletIds)) {
      extendedParams.excludedIds = explorerRecommendedWalletIds.join(',')
    }

    // Don't fetch user defined excluded wallets & recomended wallets
    if (CoreUtil.isArray(explorerExcludedWalletIds)) {
      extendedParams.excludedIds = [extendedParams.excludedIds, explorerExcludedWalletIds]
        .filter(Boolean)
        .join(',')
    }

    const { page, search } = params
    const { listings: listingsObj, total } = isMobile
      ? await ExplorerUtil.getMobileListings(extendedParams)
      : await ExplorerUtil.getDesktopListings(extendedParams)
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
