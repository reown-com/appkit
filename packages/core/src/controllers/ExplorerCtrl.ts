import { proxy } from 'valtio/vanilla'
import type { ExplorerCtrlState, PageParams } from '../types/controllerTypes'
import { fetchWallets, formatImageUrl } from '../utils/ExplorerApi'
import { ConfigCtrl } from './ConfigCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ExplorerCtrlState>({
  wallets: { listings: [], total: 0, page: 1 },
  search: { listings: [], total: 0, page: 1 },
  previewWallets: [],
  recomendedWallets: []
})

// -- helpers ------------------------------------------------------ //
function getProjectId() {
  const { projectId } = ConfigCtrl.state
  if (!projectId) throw new Error('projectId is required to work with explorer api')

  return projectId
}

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  async getPreviewWallets(params: PageParams) {
    const { listings } = await fetchWallets(getProjectId(), params)
    state.previewWallets = Object.values(listings)

    return state.previewWallets
  },

  async getRecomendedWallets() {
    const { listings } = await fetchWallets(getProjectId(), { page: 1, entries: 6 })
    state.recomendedWallets = Object.values(listings)
  },

  async getPaginatedWallets(params: PageParams) {
    const { page, search } = params
    const { listings: listingsObj, total } = await fetchWallets(getProjectId(), params)
    const listings = Object.values(listingsObj)
    const type = search ? 'search' : 'wallets'
    state[type] = {
      listings: [...state[type].listings, ...listings],
      total,
      page: page ?? 1
    }

    return { listings, total }
  },

  getImageUrl(imageId: string) {
    return formatImageUrl(getProjectId(), imageId)
  },

  resetSearch() {
    state.search = { listings: [], total: 0, page: 1 }
  }
}
