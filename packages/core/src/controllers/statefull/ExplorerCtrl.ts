import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ExplorerCtrlState, PageParams } from '../../../types/statefullCtrlTypes'
import { fetchWallets } from '../../utils/ExplorerApi'

// -- initial state ------------------------------------------------ //
const state = proxy<ExplorerCtrlState>({
  wallets: { listings: [], total: 0, page: 1 },
  search: { listings: [], total: 0, page: 1 },
  previewWallets: []
})

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  subscribe(callback: (newState: ExplorerCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  async getPreviewWallets(params: PageParams) {
    const { listings } = await fetchWallets(params)
    state.previewWallets = Object.values(listings)

    return state.previewWallets
  },

  async getPaginatedWallets(params: PageParams) {
    const { page, search } = params
    const { listings: listingsObj, total } = await fetchWallets(params)
    const listings = Object.values(listingsObj)
    const type = search ? 'search' : 'wallets'
    state[type] = {
      listings: [...state[type].listings, ...listings],
      total,
      page: page ?? 1
    }

    return { listings, total }
  },

  resetSearch() {
    state.search = { listings: [], total: 0, page: 1 }
  }
}
