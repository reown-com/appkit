import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  ApiWallet,
  ProjectId
} from '../utils/TypeUtils.js'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://api.web3modal.com' })
const entries = 24
const recommendedEntries = 4
const sdkVersion = `js-3.0.0`
const sdkType = 'w3m'

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  projectId: ProjectId
  page: number
  count: number
  recommended: ApiWallet[]
  wallets: ApiWallet[]
  search: ApiWallet[]
  images: Record<string, string>
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  projectId: '',
  page: 1,
  count: 0,
  recommended: [],
  wallets: [],
  search: [],
  images: {}
})

// -- Controller ---------------------------------------- //
export const ApiController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setProjectId(projectId: ApiControllerState['projectId']) {
    state.projectId = projectId
  },

  getApiHeaders() {
    return {
      'x-project-id': state.projectId,
      'x-sdk-type': sdkType,
      'x-sdk-version': sdkVersion
    }
  },

  async fetchImageBlob(imageId: string) {
    const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, headers: ApiController.getApiHeaders() })
    state.images[imageId] = URL.createObjectURL(blob)
  },

  async fetchRecommendedWallets() {
    const { data } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController.getApiHeaders(),
      body: {
        page: 1,
        entries: recommendedEntries
      }
    })
    await Promise.all(data.map(({ image_id }) => ApiController.fetchImageBlob(image_id)))
    state.recommended = data
  },

  async fetchWallets({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const exclude = state.recommended.map(({ id }) => id)
    const { data, count } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController.getApiHeaders(),
      body: {
        page,
        entries,
        exclude
      }
    })
    await Promise.all([
      ...data.map(({ image_id }) => ApiController.fetchImageBlob(image_id)),
      CoreHelperUtil.wait(300)
    ])
    state.wallets = [...state.wallets, ...data]
    state.count = count
    state.page = page
  },

  async searchWallet({ search }: Pick<ApiGetWalletsRequest, 'search'>) {
    state.search = []
    const { data } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController.getApiHeaders(),
      body: {
        page: 1,
        entries: 100,
        search
      }
    })
    await Promise.all(data.map(({ image_id }) => ApiController.fetchImageBlob(image_id)))
    state.search = data
  }
}
