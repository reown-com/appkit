import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  ApiWallet,
  ProjectId,
  SdkVersion
} from '../utils/TypeUtils.js'
import { AssetController } from './AssetController.js'
import { ConnectorController } from './ConnectorController.js'
import { NetworkController } from './NetworkController.js'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://api.web3modal.com' })
const entries = 24
const recommendedEntries = 4
const sdkType = 'w3m'

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  projectId: ProjectId
  sdkVersion: SdkVersion
  page: number
  count: number
  recommended: ApiWallet[]
  wallets: ApiWallet[]
  search: ApiWallet[]
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  projectId: '',
  sdkVersion: 'html-wagmi-undefined',
  page: 1,
  count: 0,
  recommended: [],
  wallets: [],
  search: []
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

  setSdkVersion(sdkVersion: ApiControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion
  },

  _getApiHeaders() {
    return {
      'x-project-id': state.projectId,
      'x-sdk-type': sdkType,
      'x-sdk-version': state.sdkVersion
    }
  },

  async _fetchWalletImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() })
    AssetController.setWalletImage(imageId, URL.createObjectURL(blob))
  },

  async _fetchNetworkImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() })
    AssetController.setNetworkImage(imageId, URL.createObjectURL(blob))
  },

  async _fetchConnectorImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() })
    AssetController.setConnectorImage(imageId, URL.createObjectURL(blob))
  },

  async fetchNetworkImages() {
    const { requestedCaipNetworks } = NetworkController.state
    const ids = requestedCaipNetworks?.map(({ imageId }) => imageId).filter(Boolean)
    if (ids) {
      await Promise.all((ids as string[]).map(id => ApiController._fetchNetworkImage(id)))
    }
  },

  async fetchConnectorImages() {
    const { connectors } = ConnectorController.state
    const ids = connectors.map(({ imageId }) => imageId).filter(Boolean)
    await Promise.all((ids as string[]).map(id => ApiController._fetchConnectorImage(id)))
  },

  async fetchRecommendedWallets() {
    const { connectors } = ConnectorController.state
    const exclude = connectors.map(({ explorerId }) => explorerId).filter(Boolean)
    const { data } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      body: {
        page: 1,
        entries: recommendedEntries,
        exclude: exclude.length ? exclude : undefined
      }
    })
    await Promise.all(data.map(({ image_id }) => ApiController._fetchWalletImage(image_id)))
    state.recommended = data
  },

  async fetchWallets({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const { connectors } = ConnectorController.state
    const excludeRecommended = state.recommended.map(({ id }) => id)
    const excludeConnectors = connectors.map(({ explorerId }) => explorerId).filter(Boolean)
    const exclude = [...excludeRecommended, ...excludeConnectors]
    const { data, count } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      body: {
        page,
        entries,
        exclude: exclude.length ? exclude : undefined
      }
    })
    await Promise.all([
      ...data.map(({ image_id }) => ApiController._fetchWalletImage(image_id)),
      CoreHelperUtil.wait(300)
    ])
    state.wallets = [...state.wallets, ...data]
    state.count = count
    state.page = page
  },

  async searchWallet({ search }: Pick<ApiGetWalletsRequest, 'search'>) {
    const { connectors } = ConnectorController.state
    const exclude = connectors.map(({ explorerId }) => explorerId).filter(Boolean)
    state.search = []
    const { data } = await api.post<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      body: {
        page: 1,
        entries: 100,
        search,
        exclude: exclude.length ? exclude : undefined
      }
    })
    await Promise.all(data.map(({ image_id }) => ApiController._fetchWalletImage(image_id)))
    state.search = data
  }
}
