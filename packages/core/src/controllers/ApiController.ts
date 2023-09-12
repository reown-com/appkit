import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  SdkVersion,
  WcWallet
} from '../utils/TypeUtils.js'
import { AssetController } from './AssetController.js'
import { ConnectorController } from './ConnectorController.js'
import { NetworkController } from './NetworkController.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://api.web3modal.com' })
const entries = '40'
const recommendedEntries = '4'
const sdkType = 'w3m'

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  prefetchPromise?: Promise<unknown>
  sdkVersion: SdkVersion
  page: number
  count: number
  featured: WcWallet[]
  recommended: WcWallet[]
  wallets: WcWallet[]
  search: WcWallet[]
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  sdkVersion: 'html-wagmi-undefined',
  page: 1,
  count: 0,
  featured: [],
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

  setSdkVersion(sdkVersion: ApiControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion
  },

  _getApiHeaders() {
    return {
      'x-project-id': OptionsController.state.projectId,
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
      await Promise.allSettled((ids as string[]).map(id => ApiController._fetchNetworkImage(id)))
    }
  },

  async fetchConnectorImages() {
    const { connectors } = ConnectorController.state
    const ids = connectors.map(({ imageId }) => imageId).filter(Boolean)
    await Promise.allSettled((ids as string[]).map(id => ApiController._fetchConnectorImage(id)))
  },

  async fetchFeaturedWallets() {
    const { featuredWalletIds } = OptionsController.state
    if (featuredWalletIds?.length) {
      const { data } = await api.get<ApiGetWalletsResponse>({
        path: '/getWallets',
        headers: ApiController._getApiHeaders(),
        params: {
          page: '1',
          entries: featuredWalletIds?.length
            ? String(featuredWalletIds.length)
            : recommendedEntries,
          include: featuredWalletIds?.join(',')
        }
      })

      const images = data.map(d => d.image_id).filter(Boolean)
      await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)))
      state.featured = data
    }
  },

  async fetchRecommendedWallets() {
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
    const exclude = [...(excludeWalletIds ?? []), ...(featuredWalletIds ?? [])].filter(Boolean)
    const { data, count } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: '1',
        entries: recommendedEntries,
        include: includeWalletIds?.join(','),
        exclude: exclude?.join(',')
      }
    })
    const recent = StorageUtil.getRecentWallets()
    const recommendedImages = data.map(d => d.image_id).filter(Boolean)
    const recentImages = recent.map(r => r.image_id).filter(Boolean)
    await Promise.allSettled(
      ([...recommendedImages, ...recentImages] as string[]).map(id =>
        ApiController._fetchWalletImage(id)
      )
    )
    state.recommended = data
    state.count = count ?? 0
  },

  async fetchWallets({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
    const exclude = [
      ...state.recommended.map(({ id }) => id),
      ...(excludeWalletIds ?? []),
      ...(featuredWalletIds ?? [])
    ].filter(Boolean)
    const { data, count } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: String(page),
        entries,
        include: includeWalletIds?.join(','),
        exclude: exclude.join(',')
      }
    })
    const images = data.map(w => w.image_id).filter(Boolean)
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ])
    state.wallets = [...state.wallets, ...data]
    state.count = count > state.count ? count : state.count
    state.page = page
  },

  async searchWallet({ search }: Pick<ApiGetWalletsRequest, 'search'>) {
    const { includeWalletIds, excludeWalletIds } = OptionsController.state
    state.search = []
    const { data } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: '1',
        entries: '100',
        search,
        include: includeWalletIds?.join(','),
        exclude: excludeWalletIds?.join(',')
      }
    })
    const images = data.map(w => w.image_id).filter(Boolean)
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ])
    state.search = data
  },

  prefetch() {
    state.prefetchPromise = Promise.race([
      Promise.allSettled([
        ApiController.fetchFeaturedWallets(),
        ApiController.fetchRecommendedWallets(),
        ApiController.fetchNetworkImages(),
        ApiController.fetchConnectorImages()
      ]),
      CoreHelperUtil.wait(3000)
    ])
  }
}
