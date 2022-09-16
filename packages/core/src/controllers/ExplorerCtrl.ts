import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Listing, ListingResponse, PageParams } from '../../types/explorerTypes'
import { fetchWallets } from '../utils/ExplorerApi'

// -- types -------------------------------------------------------- //
export interface State {
  search: string
  page: number
  wallets: ListingResponse
  previewWallets: Listing[]
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  search: '',
  page: 1,
  wallets: { listings: [], total: 0 },
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
    const { listings: listingsObj, total } = await fetchWallets(params)
    const listings = Object.values(listingsObj)
    state.wallets = {
      listings: [...state.wallets.listings, ...listings],
      total
    }
    const { page, search } = params
    if (typeof page !== 'undefined' && state.page !== page) state.page = page
    if (typeof search !== 'undefined' && state.search !== search) state.search = search

    return { listings, total }
  }
}
