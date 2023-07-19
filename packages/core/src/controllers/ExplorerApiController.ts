import { CoreHelperUtil } from '@web3modal/core'
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { FetchUtil } from '../utils/FetchUtil'
import type {
  ExplorerListing,
  ExplorerListingsRequest,
  ExplorerListingsResponse,
  ExplorerSearchRequest,
  ProjectId
} from '../utils/TypeUtils'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://explorer-api.walletconnect.com' })
const entries = 32

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

  async fetchListings(req?: ExplorerListingsRequest) {
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
  },

  async searchListings(req: ExplorerSearchRequest) {
    state.search = []
    const [response] = await Promise.all([
      await api.get<ExplorerListingsResponse>({
        path: '/w3m/v1/getAllListings',
        params: {
          projectId: state.projectId,
          search: req.search
        }
      }),
      CoreHelperUtil.wait(300)
    ])
    state.search = response.listings ? Object.values(response.listings) : []
  }
}
