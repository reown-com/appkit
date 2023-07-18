import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { FetchUtil } from '../utils/FetchUtil'
import type { ExplorerListing, ExplorerListingsResponse, ProjectId } from '../utils/TypeUtils'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://explorer-api.walletconnect.com' })
const entries = 24

// -- Types --------------------------------------------- //
export interface ExplorerApiControllerState {
  projectId: ProjectId
  page: number
  total: number
  listings: ExplorerListing[]
  search: ExplorerListing[]
}

type StateKey = keyof ExplorerApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ExplorerApiControllerState>({
  projectId: '',
  page: 1,
  total: 0,
  listings: [],
  search: []
})

// -- Controller ---------------------------------------- //
export const ExplorerApiController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ExplorerApiControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  setProjectId(projectId: ExplorerApiControllerState['projectId']) {
    state.projectId = projectId
  },

  async fetchWallets() {
    const response = await api.get<ExplorerListingsResponse>({
      path: '/w3m/v1/getAllListings',
      params: { projectId: state.projectId, page: 1, entries }
    })
    state.listings = [...state.listings, ...Object.values(response.listings)]
    state.total = response.total
  }
}
