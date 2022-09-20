import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Listing, ListingResponse, PageParams } from '../../types/explorerTypes'
import { fetchWallets } from '../utils/ExplorerApi'

// -- types -------------------------------------------------------- //
export interface State {
  search: string
  page: number
  wallets: ListingResponse
  previewWallets: Listing[]
  isLoading: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  search: '',
  page: 1,
  wallets: { listings: [], total: 0 },
  isLoading: false,
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

  async getPaginatedWallets(params: PageParams, appendResults = true) {
    const { page, search } = params

    if (typeof page !== 'undefined' && state.page !== page) state.page = page
    if (typeof search !== 'undefined' && state.search !== search) {
      state.search = search
      state.page = 1
    }

    this.state.isLoading = true
    const { listings: listingsObj, total } = await fetchWallets({
      ...params,
      page: this.state.page
    })

    const listings = appendResults
      ? [...state.wallets.listings, ...Object.values(listingsObj)]
      : Object.values(listingsObj)
    state.wallets = {
      listings,
      total
    }

    this.state.isLoading = false

    return { listings, total }
  }
}
