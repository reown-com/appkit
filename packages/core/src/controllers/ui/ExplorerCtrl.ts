import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Listing, ListingResponse, PageParams } from '../../../types/explorerTypes'
import { fetchWallets } from '../../utils/ExplorerApi'

// -- types -------------------------------------------------------- //
export interface State {
  wallets: ListingResponse & { page: number }
  search: ListingResponse & { page: number }
  previewWallets: Listing[]
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  wallets: { listings: [], total: 0, page: 1 },
  search: { listings: [], total: 0, page: 1 },
  previewWallets: []
})

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  async getPreviewWallets() {
    const { listings } = await fetchWallets({ page: 1, entries: 10, version: 1 })
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
