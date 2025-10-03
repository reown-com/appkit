import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { ConstantsUtil } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'

import { AssetUtil } from '../utils/AssetUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { CUSTOM_DEEPLINK_WALLETS } from '../utils/MobileWallet.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ApiGetAllowedOriginsResponse,
  ApiGetAnalyticsConfigResponse,
  ApiGetProjectConfigResponse,
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
export const api = new FetchUtil({
  baseUrl,
  clientId: null
})
const entries = 40
const recommendedEntries = 4
const imageCountToFetch = 20

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  promises: Record<string, Promise<unknown>>
  page: number
  count: number
  featured: WcWallet[]
  allFeatured: WcWallet[]
  recommended: WcWallet[]
  allRecommended: WcWallet[]
  wallets: WcWallet[]
  explorerWallets: WcWallet[]
  explorerFilteredWallets: WcWallet[]
  filteredWallets: WcWallet[]
  search: WcWallet[]
  isAnalyticsEnabled: boolean
  excludedWallets: { rdns?: string | null; name: string }[]
  isFetchingRecommendedWallets: boolean
  mobileFilteredOutWalletsLength?: number
}

interface PrefetchParameters {
  fetchConnectorImages?: boolean
  fetchFeaturedWallets?: boolean
  fetchRecommendedWallets?: boolean
  fetchNetworkImages?: boolean
  fetchWalletRanks?: boolean
}

type StateKey = keyof ApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  promises: {},
  page: 1,
  count: 0,
  featured: [],
  allFeatured: [],
  recommended: [],
  allRecommended: [],
  wallets: [],
  filteredWallets: [],
  search: [],
  isAnalyticsEnabled: false,
  excludedWallets: [],
  isFetchingRecommendedWallets: false,
  explorerWallets: [],
  explorerFilteredWallets: []
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

  _filterWalletsByPlatform(wallets: WcWallet[]) {
    const walletsLength = wallets.length
    const filteredWallets = CoreHelperUtil.isMobile()
      ? wallets?.filter(w => {
          if (w.mobile_link || w.webapp_link) {
            return true
          }

          const customDeeplinkWalletIds = Object.values(CUSTOM_DEEPLINK_WALLETS).map(
            wallet => wallet.id
          )

          return customDeeplinkWalletIds.includes(w.id)
        })
      : wallets

    const mobileFilteredOutWalletsLength = walletsLength - filteredWallets.length

    return { filteredWallets, mobileFilteredOutWalletsLength }
  },

  async fetchProjectConfig() {
    const response = await api.get<ApiGetProjectConfigResponse>({
      path: '/appkit/v1/config',
      params: ApiController._getSdkProperties()
    })

    return response.features
  },

  async fetchAllowedOrigins() {
    try {
      const { allowedOrigins } = await api.get<ApiGetAllowedOriginsResponse>({
        path: '/projects/v1/origins',
        params: ApiController._getSdkProperties()
      })

      return allowedOrigins
    } catch (error) {
      if (error instanceof Error && error.cause instanceof Response) {
        const status = error.cause.status

        if (status === ConstantsUtil.HTTP_STATUS_CODES.TOO_MANY_REQUESTS) {
          throw new Error('RATE_LIMITED', { cause: error })
        }

        if (status >= ConstantsUtil.HTTP_STATUS_CODES.SERVER_ERROR && status < 600) {
          throw new Error('SERVER_ERROR', { cause: error })
        }

        return []
      }

      return []
    }
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

  async fetchWallets(params: Omit<ApiGetWalletsRequest, 'chains'> & { chains?: string }) {
    const exclude = params.exclude ?? []
    const sdkProperties = ApiController._getSdkProperties()
    if (sdkProperties.sv.startsWith('html-core-')) {
      exclude.push(...Object.values(CUSTOM_DEEPLINK_WALLETS).map(w => w.id))
    }

    const wallets = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        ...params,
        page: String(params.page),
        entries: String(params.entries),
        include: params.include?.join(','),
        exclude: exclude.join(',')
      }
    })

    const { filteredWallets, mobileFilteredOutWalletsLength } =
      ApiController._filterWalletsByPlatform(wallets?.data)

    return {
      data: filteredWallets || [],
      // Keep original count for display on main page
      count: wallets?.count,
      mobileFilteredOutWalletsLength
    }
  },

  async prefetchWalletRanks() {
    const connectors = ConnectorController.state.connectors
    if (!connectors?.length) {
      return
    }

    const params: Omit<ApiGetWalletsRequest, 'chains'> & { chains?: string } = {
      page: 1,
      entries: 20,
      badge: 'certified'
    }

    params.names = connectors.map(c => c.name).join(',')

    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM) {
      const rdnsCandidates = [
        ...connectors.flatMap(c => c.connectors?.map(sc => sc.info?.rdns) || []),
        ...connectors.map(c => c.info?.rdns)
      ].filter((val): val is string => typeof val === 'string' && val.length > 0)

      if (rdnsCandidates.length) {
        params.rdns = rdnsCandidates.join(',')
      }
    }

    const { data } = await ApiController.fetchWallets(params)

    state.explorerWallets = data

    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')
    state.explorerFilteredWallets = data.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )
  },

  async fetchFeaturedWallets() {
    const { featuredWalletIds } = OptionsController.state
    if (featuredWalletIds?.length) {
      const params = {
        ...ApiController._getSdkProperties(),
        page: 1,
        entries: featuredWalletIds?.length ?? recommendedEntries,
        include: featuredWalletIds
      }
      const { data } = await ApiController.fetchWallets(params)

      const sortedData = [...data].sort(
        (a, b) => featuredWalletIds.indexOf(a.id) - featuredWalletIds.indexOf(b.id)
      )

      const images = sortedData.map(d => d.image_id).filter(Boolean)
      await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)))
      state.featured = sortedData
      state.allFeatured = sortedData
    }
  },

  async fetchRecommendedWallets() {
    try {
      state.isFetchingRecommendedWallets = true
      const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
      const exclude = [...(excludeWalletIds ?? []), ...(featuredWalletIds ?? [])].filter(Boolean)
      const chains = ChainController.getRequestedCaipNetworkIds().join(',')
      const params = {
        page: 1,
        entries: recommendedEntries,
        include: includeWalletIds,
        exclude,
        chains
      }
      const { data, count } = await ApiController.fetchWallets(params)
      const recent = StorageUtil.getRecentWallets()
      const recommendedImages = data.map(d => d.image_id).filter(Boolean)
      const recentImages = recent.map(r => r.image_id).filter(Boolean)
      await Promise.allSettled(
        ([...recommendedImages, ...recentImages] as string[]).map(id =>
          ApiController._fetchWalletImage(id)
        )
      )
      state.recommended = data
      state.allRecommended = data
      state.count = count ?? 0
    } catch {
      // Catch silently
    } finally {
      state.isFetchingRecommendedWallets = false
    }
  },

  async fetchWalletsByPage({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state
    const chains = ChainController.getRequestedCaipNetworkIds().join(',')
    const exclude = [
      ...state.recommended.map(({ id }) => id),
      ...(excludeWalletIds ?? []),
      ...(featuredWalletIds ?? [])
    ].filter(Boolean)
    const params = {
      page,
      entries,
      include: includeWalletIds,
      exclude,
      chains
    }
    const { data, count, mobileFilteredOutWalletsLength } = await ApiController.fetchWallets(params)

    state.mobileFilteredOutWalletsLength =
      mobileFilteredOutWalletsLength + (state.mobileFilteredOutWalletsLength ?? 0)

    const images = data
      .slice(0, imageCountToFetch)
      .map(w => w.image_id)
      .filter(Boolean)
    await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)))

    state.wallets = CoreHelperUtil.uniqueBy(
      [...state.wallets, ...ApiController._filterOutExtensions(data)],
      'id'
    ).filter(w => w.chains?.some(chain => chains.includes(chain)))

    state.count = count > state.count ? count : state.count
    state.page = page
  },

  async initializeExcludedWallets({ ids }: { ids: string[] }) {
    const params = {
      page: 1,
      entries: ids.length,
      include: ids
    }
    const { data } = await ApiController.fetchWallets(params)

    if (data) {
      data.forEach(wallet => {
        state.excludedWallets.push({ rdns: wallet.rdns, name: wallet.name })
      })
    }
  },

  async searchWallet({ search, badge }: Pick<ApiGetWalletsRequest, 'search' | 'badge'>) {
    const { includeWalletIds, excludeWalletIds } = OptionsController.state
    const chains = ChainController.getRequestedCaipNetworkIds().join(',')
    state.search = []

    const params = {
      page: 1,
      entries: 100,
      search: search?.trim(),
      badge_type: badge,
      include: includeWalletIds,
      exclude: excludeWalletIds,
      chains
    }

    const { data } = await ApiController.fetchWallets(params)

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
    fetchNetworkImages = true,
    fetchWalletRanks = true
  }: PrefetchParameters = {}) {
    const promises = [
      fetchConnectorImages &&
        ApiController.initPromise('connectorImages', ApiController.fetchConnectorImages),
      fetchFeaturedWallets &&
        ApiController.initPromise('featuredWallets', ApiController.fetchFeaturedWallets),
      fetchRecommendedWallets &&
        ApiController.initPromise('recommendedWallets', ApiController.fetchRecommendedWallets),
      fetchNetworkImages &&
        ApiController.initPromise('networkImages', ApiController.fetchNetworkImages),
      fetchWalletRanks &&
        ApiController.initPromise('walletRanks', ApiController.prefetchWalletRanks)
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
  },

  filterByNamespaces(namespaces: ChainNamespace[] | undefined) {
    if (!namespaces?.length) {
      state.featured = state.allFeatured
      state.recommended = state.allRecommended

      return
    }

    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

    state.featured = state.allFeatured.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )

    state.recommended = state.allRecommended.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )

    state.filteredWallets = state.wallets.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )
  },

  clearFilterByNamespaces() {
    state.filteredWallets = []
  },

  setFilterByNamespace(namespace: ChainNamespace | undefined) {
    if (!namespace) {
      state.featured = state.allFeatured
      state.recommended = state.allRecommended

      return
    }

    const caipNetworkIds = ChainController.getRequestedCaipNetworkIds().join(',')

    state.featured = state.allFeatured.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )

    state.recommended = state.allRecommended.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )

    state.filteredWallets = state.wallets.filter(wallet =>
      wallet.chains?.some(chain => caipNetworkIds.includes(chain))
    )
  }
}
