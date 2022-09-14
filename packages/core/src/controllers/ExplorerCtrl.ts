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
  wallets: { listings: [], count: 0 },
  previewWallets: []
})

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  async getPreviewWallets() {
    const { listings, count } = await fetchWallets({ page: 1, entries: 10, version: 1 })
    state.previewWallets = Object.values(listings)
    state.wallets = { listings: state.previewWallets, count }

    return state.previewWallets
  },

  async getWallets(params: PageParams) {
    const { listings, count } = await fetchWallets(params)
    state.wallets = { listings: Object.values(listings), count }
    const { page, search } = params
    if (typeof page !== 'undefined' && state.page !== page) state.page = page
    if (typeof search !== 'undefined' && state.search !== search) state.search = search

    return { listings, count }
  }
}
