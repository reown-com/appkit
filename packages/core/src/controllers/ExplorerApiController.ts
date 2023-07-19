import { CoreHelperUtil } from '@web3modal/core'
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { FetchUtil } from '../utils/FetchUtil'
import type {
  ExplorerListing,
  ExplorerListingsRequest,
  ExplorerListingsResponse,
  ProjectId
} from '../utils/TypeUtils'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://explorer-api.walletconnect.com' })
const entries = 32

// -- Types --------------------------------------------- //
export interface ExplorerApiControllerState {
  fetching: boolean
  projectId: ProjectId
  page: number
  total: number
  listings: ExplorerListing[]
  search: ExplorerListing[]
}

type StateKey = keyof ExplorerApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ExplorerApiControllerState>({
  fetching: false,
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

  async fetchListings(req?: ExplorerListingsRequest) {
    try {
      if (!state.fetching) {
        state.fetching = true
        const page = req?.page ?? 1
        const [response] = await Promise.all([
          api.get<ExplorerListingsResponse>({
            path: '/w3m/v1/getAllListings',
            params: {
              projectId: state.projectId,
              page,
              entries
            }
          }),
          CoreHelperUtil.wait(300)
        ])

        state.listings = [...state.listings, ...Object.values(response.listings)]
        state.total = response.total
        state.page = page
      }
    } finally {
      state.fetching = false
    }
  }
}
