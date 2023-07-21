import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil'
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
const entries = 28

// -- Types --------------------------------------------- //
export interface ExplorerApiControllerState {
  projectId: ProjectId
  page: number
  total: number
  listings: ExplorerListing[]
  search: ExplorerListing[]
  images: Record<string, string>
}

type StateKey = keyof ExplorerApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ExplorerApiControllerState>({
  projectId: '',
  page: 1,
  total: 0,
  listings: [],
  search: [],
  images: {}
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
    const response = await api.get<ExplorerListingsResponse>({
      path: '/w3m/v1/getAllListings',
      params: { projectId: state.projectId, page, entries }
    })
    const listingsArr = Object.values(response.listings)
    listingsArr.forEach(({ image_id }) => {
      state.images[image_id] = ExplorerApiController.getWalletImageUrl(image_id)
    })
    await Promise.all([
      ...Object.values(state.images).map(async url => CoreHelperUtil.preloadImage(url)),
      CoreHelperUtil.wait(300)
    ])
    state.listings = [...state.listings, ...listingsArr]
    state.total = response.total
    state.page = page
  },

  async searchListings(req: ExplorerSearchRequest) {
    state.search = []
    const response = await api.get<ExplorerListingsResponse>({
      path: '/w3m/v1/getAllListings',
      params: { projectId: state.projectId, search: req.search }
    })
    const searchArr = Object.values(response.listings)
    searchArr.forEach(({ image_id }) => {
      state.images[image_id] = ExplorerApiController.getWalletImageUrl(image_id)
    })
    await Promise.all(
      Object.values(state.images).map(async url => CoreHelperUtil.preloadImage(url))
    )
    state.search = searchArr ? Object.values(searchArr) : []
  },

  getWalletImageUrl(imageId: string) {
    return `${api.baseUrl}/w3m/v1/getWalletImage/${imageId}?projectId=${state.projectId}`
  }
}
