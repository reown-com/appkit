import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { AssetUtil } from '../utils/AssetUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ApiGetAnalyticsConfigResponse,
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  WcWallet
} from '../utils/TypeUtil.js'
import { AssetController } from './AssetController.js'
import { ChainController } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getApiUrl()
export const api = new FetchUtil({ baseUrl, clientId: null })
const entries = '40'
const recommendedEntries = '4'
const imageCountToFetch = 20

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  promises: Record<string, Promise<unknown>>
  page: number
  count: number
  featured: WcWallet[]
  recommended: WcWallet[]
  wallets: WcWallet[]
  search: WcWallet[]
  isAnalyticsEnabled: boolean
  excludedRDNS: string[]
  isFetchingRecommendedWallets: boolean
}

interface PrefetchParameters {
  fetchConnectorImages?: boolean
  fetchFeaturedWallets?: boolean
  fetchRecommendedWallets?: boolean
  fetchNetworkImages?: boolean
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  promises: {},
  page: 1,
  count: 0,
  featured: [],
  recommended: [],
  wallets: [],
  search: [],
  isAnalyticsEnabled: false,
  excludedRDNS: [],
  isFetchingRecommendedWallets: false
})

// -- Controller ---------------------------------------- //
export const ApiController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _getSdkProperties() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state

    return {
      projectId,
      st: sdkType || 'appkit',
      sv: sdkVersion || 'html-wagmi-4.2.2'
    }
  },

  _filterOutExtensions(wallets: WcWallet[]) {
    if (OptionsController.state.isUniversalProvider) {
      return wallets.filter(w => Boolean(w.mobile_link || w.desktop_link || w.webapp_link))
    }

    return wallets
  },

  async _fetchWalletImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, params: ApiController._getSdkProperties() })
    AssetController.setWalletImage(imageId, URL.createObjectURL(blob))
  },

  async _fetchNetworkImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, params: ApiController._getSdkProperties() })
    AssetController.setNetworkImage(imageId, URL.createObjectURL(blob))
  },

  async _fetchConnectorImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`
    const blob = await api.getBlob({ path: imageUrl, params: ApiController._getSdkProperties() })
    AssetController.setConnectorImage(imageId, URL.createObjectURL(blob))
  },

  async _fetchCurrencyImage(countryCode: string) {
    const imageUrl = `${api.baseUrl}/public/getCurrencyImage/${countryCode}`
    const blob = await api.getBlob({ path: imageUrl, params: ApiController._getSdkProperties() })
    AssetController.setCurrencyImage(countryCode, URL.createObjectURL(blob))
  },

  async _fetchTokenImage(symbol: string) {
    const imageUrl = `${api.baseUrl}/public/getTokenImage/${symbol}`
    const blob = await api.getBlob({ path: imageUrl, params: ApiController._getSdkProperties() })
    AssetController.setTokenImage(symbol, URL.createObjectURL(blob))
  },

  async fetchNetworkImages() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()

    const ids = requestedCaipNetworks
      ?.map(({ assets }) => assets?.imageId)
      .filter(Boolean)
      .filter(imageId => !AssetUtil.getNetworkImageById(imageId))

    if (ids) {
      await Promise.allSettled((ids as string[]).map(id => ApiController._fetchNetworkImage(id)))
    }
  },

  async fetchConnectorImages() {
    const { connectors } = ConnectorController.state
    const ids = connectors.map(({ imageId }) => imageId).filter(Boolean)
    await Promise.allSettled((ids as string[]).map(id => ApiController._fetchConnectorImage(id)))
  },

  async fetchCurrencyImages(currencies: string[] = []) {
    await Promise.allSettled(
      currencies.map(currency => ApiController._fetchCurrencyImage(currency))
    )
  },

  async fetchTokenImages(tokens: string[] = []) {
    await Promise.allSettled(tokens.map(token => ApiController._fetchTokenImage(token)))
  },

  async fetchFeaturedWallets() {
    const { featuredWalletIds } = OptionsController.state
    if (featuredWalletIds?.length) {
      const { data } = await api.get<ApiGetWalletsResponse>({
        path: '/getWallets',
        params: {
          ...ApiController._getSdkProperties(),
          page: '1',
          entries: featuredWalletIds?.length
            ? String(featuredWalletIds.length)
            : recommendedEntries,
          include: featuredWalletIds?.join(',')
        }
      })
      data.sort((a, b) => featuredWalletIds.indexOf(a.id) - featuredWalletIds.indexOf(b.id))
      const images = data.map(d => d.image_id).filter(Boolean)
      await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)))
      state.featured = data
    }
  },

  async fetchRecommendedWallets() {
    try {
      state.isFetchingRecommendedWallets = true
      const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
      const exclude = [...(excludeWalletIds ?? []), ...(featuredWalletIds ?? [])].filter(Boolean)
      const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

      const { data, count } = await api.get<ApiGetWalletsResponse>({
        path: '/getWallets',
        params: {
          ...ApiController._getSdkProperties(),
          page: '1',
          chains: caipNetworkIds,
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
    } catch {
      // Catch silently
    } finally {
      state.isFetchingRecommendedWallets = false
    }
  },

  async fetchWallets({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

    const exclude = [
      ...state.recommended.map(({ id }) => id),
      ...(excludeWalletIds ?? []),
      ...(featuredWalletIds ?? [])
    ].filter(Boolean)
    const { data, count } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: String(page),
        entries,
        chains: caipNetworkIds,
        include: includeWalletIds?.join(','),
        exclude: exclude.join(',')
      }
    })
    const images = data
      .slice(0, imageCountToFetch)
      .map(w => w.image_id)
      .filter(Boolean)
    await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)))

    state.wallets = CoreHelperUtil.uniqueBy(
      [...state.wallets, ...ApiController._filterOutExtensions(data)],
      'id'
    )
    state.count = count > state.count ? count : state.count
    state.page = page
  },

  async initializeExcludedWalletRdns({ ids }: { ids: string[] }) {
    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

    const { data } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        entries: String(ids.length),
        chains: caipNetworkIds,
        include: ids?.join(',')
      }
    })

    if (data) {
      data.forEach(wallet => {
        if (wallet?.rdns) {
          state.excludedRDNS.push(wallet.rdns)
        }
      })
    }
  },

  async searchWallet({ search, badge }: Pick<ApiGetWalletsRequest, 'search' | 'badge'>) {
    const { includeWalletIds, excludeWalletIds } = OptionsController.state
    state.search = []
    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

    const { data } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        entries: '100',
        search: search?.trim(),
        badge_type: badge,
        chains: caipNetworkIds,
        include: includeWalletIds?.join(','),
        exclude: excludeWalletIds?.join(',')
      }
    })
    EventsController.sendEvent({
      type: 'track',
      event: 'SEARCH_WALLET',
      properties: { badge: badge ?? '', search: search ?? '' }
    })
    const images = data.map(w => w.image_id).filter(Boolean)
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ])
    state.search = ApiController._filterOutExtensions(data)
  },

  initPromise(key: string, fetchFn: () => Promise<void>) {
    const existingPromise = state.promises[key]

    if (existingPromise) {
      return existingPromise
    }

    return (state.promises[key] = fetchFn())
  },

  prefetch({
    fetchConnectorImages = true,
    fetchFeaturedWallets = true,
    fetchRecommendedWallets = true,
    fetchNetworkImages = true
  }: PrefetchParameters = {}) {
    const promises = [
      fetchConnectorImages &&
        ApiController.initPromise('connectorImages', ApiController.fetchConnectorImages),
      fetchFeaturedWallets &&
        ApiController.initPromise('featuredWallets', ApiController.fetchFeaturedWallets),
      fetchRecommendedWallets &&
        ApiController.initPromise('recommendedWallets', ApiController.fetchRecommendedWallets),
      fetchNetworkImages &&
        ApiController.initPromise('networkImages', ApiController.fetchNetworkImages)
    ].filter(Boolean)

    return Promise.allSettled(promises)
  },

  prefetchAnalyticsConfig() {
    if (OptionsController.state.features?.analytics) {
      ApiController.fetchAnalyticsConfig()
    }
  },

  async fetchAnalyticsConfig() {
    try {
      const { isAnalyticsEnabled } = await api.get<ApiGetAnalyticsConfigResponse>({
        path: '/getAnalyticsConfig',
        params: ApiController._getSdkProperties()
      })
      OptionsController.setFeatures({ analytics: isAnalyticsEnabled })
    } catch (error) {
      OptionsController.setFeatures({ analytics: false })
    }
  }
}
