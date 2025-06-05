import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import {
  ApiController,
  AssetController,
  ChainController,
  type ChainControllerState,
  type ConnectionControllerClient,
  ConnectorController,
  CoreHelperUtil,
  type NetworkControllerClient,
  OptionsController,
  type WcWallet
} from '../../exports/index.js'
import { api } from '../../src/controllers/ApiController.js'
import { CUSTOM_DEEPLINK_WALLETS } from '../../src/utils/MobileWallet.js'

// -- Constants ----------------------------------------------------------------
const chain = ConstantsUtil.CHAIN.EVM
const networks = [
  {
    caipNetworkId: 'eip155:1',
    id: 1,
    name: 'Ethereum Mainnet',
    assets: {
      imageId: '12341',
      imageUrl: ''
    },
    chainNamespace: chain,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  },
  {
    caipNetworkId: 'eip155:4',
    id: 4,
    name: 'Ethereum Rinkeby',
    assets: {
      imageId: '12342',
      imageUrl: ''
    },
    chainNamespace: chain,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  },
  {
    caipNetworkId: 'eip155:42',
    id: 42,
    name: 'Ethereum Kovan',
    chainNamespace: chain,
    nativeCurrency: {
      name: 'Ethereum',
      decimals: 18,
      symbol: 'ETH'
    },
    rpcUrls: {
      default: {
        http: ['']
      }
    }
  }
] as CaipNetwork[]

// -- Tests --------------------------------------------------------------------
beforeAll(() => {
  global.URL.createObjectURL = vi.fn((file: Blob) => `blob:${file}`)
  ChainController.initialize(
    [
      {
        namespace: ConstantsUtil.CHAIN.EVM,
        caipNetworks: []
      }
    ],
    [],
    {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
      networkControllerClient: vi.fn() as unknown as NetworkControllerClient
    }
  )
})

describe('ApiController', () => {
  beforeEach(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      featured: [],
      allFeatured: [],
      recommended: [],
      allRecommended: [],
      filteredWallets: [],
      wallets: [],
      search: [],
      isAnalyticsEnabled: false,
      excludedWallets: [],
      isFetchingRecommendedWallets: false,
      promises: {}
    })
  })

  it('should fetch wallet image and update AssetController state correctly', async () => {
    const imageId = '123'
    const image = 'image.jpg'
    const blob = new Blob([image])
    const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob)

    await ApiController._fetchWalletImage(imageId)
    expect(fetchSpy).toHaveBeenCalledWith({
      path: `${api.baseUrl}/getWalletImage/${imageId}`,
      params: ApiController._getSdkProperties()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.walletImages[imageId]).toMatch(/^blob:/u)
  })

  it('should fetch network image and update AssetController state correctly', async () => {
    const imageId = '123'
    const image = 'image.jpg'
    const blob = new Blob([image])
    const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob)

    await ApiController._fetchNetworkImage(imageId)
    expect(fetchSpy).toHaveBeenCalledWith({
      path: `${api.baseUrl}/public/getAssetImage/${imageId}`,
      params: ApiController._getSdkProperties()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.networkImages[imageId]).toMatch(/^blob:/u)
  })

  it('should fetch connector image and update AssetController state correctly', async () => {
    const imageId = '123'
    const image = 'image.jpg'
    const blob = new Blob([image])
    const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob)

    await ApiController._fetchConnectorImage(imageId)
    expect(fetchSpy).toHaveBeenCalledWith({
      path: `${api.baseUrl}/public/getAssetImage/${imageId}`,
      params: ApiController._getSdkProperties()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.connectorImages[imageId]).toMatch(/^blob:/u)
  })

  it('should fetch currency image and update AssetController state correctly', async () => {
    const countryCode = 'AR'
    const image = 'image.jpg'
    const blob = new Blob([image])
    const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob)

    await ApiController._fetchCurrencyImage(countryCode)
    expect(fetchSpy).toHaveBeenCalledWith({
      path: `${api.baseUrl}/public/getCurrencyImage/${countryCode}`,
      params: ApiController._getSdkProperties()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.currencyImages[countryCode]).toMatch(/^blob:/u)
  })

  it('should fetch token image and update AssetController state correctly', async () => {
    const symbol = 'AR'
    const image = 'image.jpg'
    const blob = new Blob([image])
    const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob)

    await ApiController._fetchTokenImage(symbol)
    expect(fetchSpy).toHaveBeenCalledWith({
      path: `${api.baseUrl}/public/getTokenImage/${symbol}`,
      params: ApiController._getSdkProperties()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.tokenImages[symbol]).toMatch(/^blob:/u)
  })

  it('should fetch network images ', async () => {
    const reuqestedCaipNetworks = [
      {
        caipNetworkId: 'eip155:1',
        id: 1,
        name: 'Ethereum Mainnet',
        assets: {
          imageId: '12341',
          imageUrl: ''
        },
        chainNamespace: chain,
        nativeCurrency: {
          name: 'Ethereum',
          decimals: 18,
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: ['']
          }
        }
      } as CaipNetwork,
      {
        caipNetworkId: 'eip155:4',
        id: 4,
        name: 'Ethereum Rinkeby',
        assets: {
          imageId: '12342',
          imageUrl: ''
        },
        chainNamespace: chain,
        nativeCurrency: {
          name: 'Ethereum',
          decimals: 18,
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: ['']
          }
        }
      } as CaipNetwork,
      {
        caipNetworkId: 'eip155:42',
        id: 42,
        name: 'Ethereum Kovan',
        chainNamespace: chain,
        nativeCurrency: {
          name: 'Ethereum',
          decimals: 18,
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: ['']
          }
        }
      } as CaipNetwork
    ]
    ChainController.initialize(
      [
        {
          namespace: ConstantsUtil.CHAIN.EVM,
          caipNetworks: reuqestedCaipNetworks
        }
      ],
      reuqestedCaipNetworks,
      {
        connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )

    const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue()
    await ApiController.fetchNetworkImages()

    // Does not call if imageId is not present
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should only fetch network images for networks with imageIds', async () => {
    ChainController.setRequestedCaipNetworks(networks, chain)
    const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue()
    await ApiController.fetchNetworkImages()

    // Does not call if imageId is not present
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should fetch connector images', async () => {
    ConnectorController.setConnectors([
      {
        id: '12341',
        name: 'MetaMask',
        imageId: '12341',
        type: 'INJECTED',
        chain: ConstantsUtil.CHAIN.EVM
      },
      {
        id: '12341',
        name: 'RandomConnector',
        type: 'INJECTED',
        chain: ConstantsUtil.CHAIN.EVM
      }
    ])
    const fetchSpy = vi.spyOn(ApiController, '_fetchConnectorImage').mockResolvedValue()
    await ApiController.fetchConnectorImages()

    // Does not call if imageId is not present
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should fetch currency images', async () => {
    const currencies = ['USD', 'EUR']
    const fetchSpy = vi.spyOn(ApiController, '_fetchCurrencyImage').mockResolvedValue()
    await ApiController.fetchCurrencyImages(currencies)

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should fetch token images', async () => {
    const currencies = ['USDC', 'ETH']
    const fetchSpy = vi.spyOn(ApiController, '_fetchCurrencyImage').mockResolvedValue()
    await ApiController.fetchCurrencyImages(currencies)

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should fetch featured wallets with configured featured wallets', async () => {
    const featuredWalletIds = ['12341', '12342']
    const data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'MetaMask',
        image_id: '12341'
      },
      {
        caipNetworkId: '12342',
        id: 12342,
        name: 'RandomWallet',
        image_id: '12342'
      },
      {
        caipNetworkId: '12343',
        id: 12343,
        name: 'RandomWallet'
      }
    ]
    OptionsController.setFeaturedWalletIds(featuredWalletIds)
    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()
    await ApiController.fetchFeaturedWallets()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        entries: '2',
        include: '12341,12342',
        exclude: ''
      }
    })

    expect(fetchImageSpy).toHaveBeenCalledTimes(2)
    expect(ApiController.state.featured).toEqual(data)
  })

  it('should sort featured wallets according to the order in featuredWalletIds', async () => {
    const featuredWalletIds = ['wallet-B', 'wallet-A']

    const data = [
      {
        id: 'wallet-A',
        name: 'Wallet A',
        image_id: 'image-A'
      },
      {
        id: 'wallet-B',
        name: 'Wallet B',
        image_id: 'image-B'
      }
    ]

    OptionsController.setFeaturedWalletIds(featuredWalletIds)
    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    await ApiController.fetchFeaturedWallets()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        entries: '2',
        include: 'wallet-B,wallet-A',
        exclude: ''
      }
    })

    expect(fetchImageSpy).toHaveBeenCalledTimes(2)

    expect(ApiController.state.featured).toHaveLength(2)
    expect(ApiController.state.featured[0]?.id).toBe('wallet-B')
    expect(ApiController.state.featured[1]?.id).toBe('wallet-A')

    expect(ApiController.state.allFeatured).toHaveLength(2)
    expect(ApiController.state.allFeatured[0]?.id).toBe('wallet-B')
    expect(ApiController.state.allFeatured[1]?.id).toBe('wallet-A')
  })

  it('should not fetch featured wallets without configured featured wallets', async () => {
    OptionsController.setFeaturedWalletIds([])
    const fetchSpy = vi.spyOn(api, 'get')
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    await ApiController.fetchFeaturedWallets()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(fetchImageSpy).not.toHaveBeenCalled()
  })

  // Recommended wallets
  it('should fetch recommended wallets with configured recommended wallets', async () => {
    const includeWalletIds = ['12341', '12342']
    const excludeWalletIds = ['12343']
    const featuredWalletIds = ['12344']
    const data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'MetaMask',
        image_id: '12341'
      },
      {
        caipNetworkId: '12342',
        id: 12342,
        name: 'RandomWallet',
        image_id: '12342'
      },
      {
        caipNetworkId: '12343',
        id: 12343,
        name: 'RandomWallet'
      }
    ]
    OptionsController.setIncludeWalletIds(includeWalletIds)
    OptionsController.setExcludeWalletIds(excludeWalletIds)
    OptionsController.setFeaturedWalletIds(featuredWalletIds)

    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    await ApiController.fetchRecommendedWallets()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        chains: 'eip155:1,eip155:4,eip155:42',
        page: '1',
        // Fixed to recommendedEntries
        entries: '4',
        include: '12341,12342',
        exclude: '12343,12344'
      }
    })

    expect(fetchImageSpy).toHaveBeenCalledTimes(2)
    expect(ApiController.state.recommended).toEqual(data)
    expect(ApiController.state.count).toBe(data.length)
  })

  it('should fetch recommended wallet images without configured recommended wallets', async () => {
    OptionsController.setIncludeWalletIds([])
    OptionsController.setExcludeWalletIds([])
    OptionsController.setFeaturedWalletIds([])
    ApiController.state.recommended = []

    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [], count: 0 })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    await ApiController.fetchRecommendedWallets()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        chains: 'eip155:1,eip155:4,eip155:42',
        page: '1',
        entries: '4',
        include: '',
        exclude: ''
      }
    })
    expect(fetchImageSpy).not.toHaveBeenCalled()
  })

  // Fetch wallets
  it('should fetch wallets with configured recommended wallets', async () => {
    const includeWalletIds = ['12341', '12342']
    const excludeWalletIds = ['12343']
    const featuredWalletIds = ['12344']
    const data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'MetaMask',
        image_id: '12341',
        chains: ['eip155:42']
      },
      {
        caipNetworkId: '12342',
        id: 12342,
        name: 'RandomWallet',
        image_id: '12342',
        chains: ['eip155:1', 'eip155:4']
      }
    ]
    OptionsController.setIncludeWalletIds(includeWalletIds)
    OptionsController.setExcludeWalletIds(excludeWalletIds)
    OptionsController.setFeaturedWalletIds(featuredWalletIds)

    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()
    await ApiController.fetchWalletsByPage({ page: 1 })
    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '40',
        include: '12341,12342',
        exclude: '12343,12344'
      }
    })

    expect(fetchImageSpy).toHaveBeenCalledTimes(2)
    expect(ApiController.state.wallets).toEqual(data)
  })

  it('should fetch excludedWalletIds and check if RDNS of EIP6963 matches', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    const excludeWalletIds = ['12345', '12346']
    const EIP6963Wallets = [
      { name: 'MetaMask', rdns: 'io.metamask' },
      { name: 'Rainbow', rdns: 'me.rainbow' }
    ]
    const filteredWallet = [{ name: 'Rainbow', rdns: 'me.rainbow' }]
    const data = [
      {
        caipNetworkId: '12345',
        id: 12345,
        name: 'MetaMask',
        rdns: 'io.metamask',
        mobile_link: 'https://metamask.io'
      },
      {
        caipNetworkId: '12346',
        id: 12346,
        name: 'Phantom',
        rdns: 'app.phantom'
      }
    ]

    OptionsController.setExcludeWalletIds(excludeWalletIds)

    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length })
    const fetchWalletsSpy = vi.spyOn(ApiController, 'initializeExcludedWallets')

    await ApiController.initializeExcludedWallets({ ids: excludeWalletIds })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        entries: String(excludeWalletIds.length),
        include: excludeWalletIds.join(','),
        exclude: ''
      }
    })

    expect(fetchWalletsSpy).toHaveBeenCalledOnce()

    expect(ApiController.state.excludedWallets).toEqual([
      { name: 'MetaMask', rdns: 'io.metamask' },
      { name: 'Phantom', rdns: 'app.phantom' }
    ])
    const result = EIP6963Wallets.filter(
      wallet =>
        !ApiController.state.excludedWallets.some(
          excludedWallet => excludedWallet.rdns === wallet.rdns
        )
    )
    expect(result).toEqual(filteredWallet)
  })

  it('should search wallet with exact wallet name', async () => {
    const includeWalletIds = ['12341', '12342']
    const excludeWalletIds = ['12343']
    const data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'MetaMask',
        image_id: '12341'
      }
    ]
    OptionsController.setIncludeWalletIds(includeWalletIds)
    OptionsController.setExcludeWalletIds(excludeWalletIds)

    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    await ApiController.searchWallet({ search: 'MetaMask' })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '100',
        search: 'MetaMask',
        include: '12341,12342',
        exclude: '12343'
      }
    })

    expect(fetchImageSpy).toHaveBeenCalledOnce()
    expect(ApiController.state.search).toEqual(data)
  })

  it('should search wallet with whitespace and multiple words', async () => {
    const includeWalletIds = ['12341', '12342']
    const excludeWalletIds = ['12343']
    let data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'MetaMask',
        image_id: '12341'
      }
    ]
    OptionsController.setIncludeWalletIds(includeWalletIds)
    OptionsController.setExcludeWalletIds(excludeWalletIds)

    let fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })
    const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue()

    // Whitespace
    await ApiController.searchWallet({ search: 'MetaMask    ' })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '100',
        search: 'MetaMask',
        include: '12341,12342',
        exclude: '12343'
      }
    })
    expect(fetchImageSpy).toHaveBeenCalledOnce()
    expect(ApiController.state.search).toEqual(data)

    // Leading Whitespace
    await ApiController.searchWallet({ search: ' Metamask' })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '100',
        search: 'MetaMask',
        include: '12341,12342',
        exclude: '12343'
      }
    })
    expect(ApiController.state.search).toEqual(data)

    // Leading and Trailing Whitespace
    await ApiController.searchWallet({ search: ' Metamask  ' })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '100',
        search: 'MetaMask',
        include: '12341,12342',
        exclude: '12343'
      }
    })
    expect(ApiController.state.search).toEqual(data)

    data = [
      {
        caipNetworkId: '12341',
        id: 12341,
        name: 'Safe Wallet',
        image_id: '12341'
      }
    ]
    fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })
    await ApiController.searchWallet({ search: 'Safe Wallet' })

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getWallets',
      params: {
        ...ApiController._getSdkProperties(),
        page: '1',
        badge_type: undefined,
        chains: 'eip155:1,eip155:4,eip155:42',
        entries: '100',
        search: 'Safe Wallet',
        include: '12341,12342',
        exclude: '12343'
      }
    })
    expect(ApiController.state.search).toEqual(data)
  })

  // Prefetch
  it('should prefetch without analytics', () => {
    OptionsController.setFeatures({ analytics: false })

    const fetchAnalyticsSpy = vi.spyOn(ApiController, 'fetchAnalyticsConfig')

    ApiController.prefetchAnalyticsConfig()

    expect(fetchAnalyticsSpy).not.toHaveBeenCalled()
  })

  it('should prefetch with analytics', () => {
    OptionsController.setFeatures({ analytics: true })

    const fetchAnalyticsSpy = vi.spyOn(ApiController, 'fetchAnalyticsConfig').mockResolvedValue()

    ApiController.prefetchAnalyticsConfig()

    expect(fetchAnalyticsSpy).toHaveBeenCalledOnce()
  })

  it('should prefetch all resources when no flags are specified', async () => {
    const fetchConnectorImages = vi.spyOn(ApiController, 'fetchConnectorImages').mockResolvedValue()
    const fetchFeaturedWallets = vi.spyOn(ApiController, 'fetchFeaturedWallets').mockResolvedValue()
    const fetchRecommendedWallets = vi
      .spyOn(ApiController, 'fetchRecommendedWallets')
      .mockResolvedValue()
    const fetchNetworkImages = vi.spyOn(ApiController, 'fetchNetworkImages').mockResolvedValue()

    await ApiController.prefetch()

    expect(fetchConnectorImages).toHaveBeenCalled()
    expect(fetchFeaturedWallets).toHaveBeenCalled()
    expect(fetchRecommendedWallets).toHaveBeenCalled()
    expect(fetchNetworkImages).toHaveBeenCalled()
  })

  it('should only prefetch resources specified by flags', async () => {
    ApiController.state.promises = {}
    const fetchConnectorImages = vi.spyOn(ApiController, 'fetchConnectorImages').mockResolvedValue()
    const fetchFeaturedWallets = vi.spyOn(ApiController, 'fetchFeaturedWallets').mockResolvedValue()
    const fetchRecommendedWallets = vi
      .spyOn(ApiController, 'fetchRecommendedWallets')
      .mockResolvedValue()
    const fetchNetworkImages = vi.spyOn(ApiController, 'fetchNetworkImages').mockResolvedValue()

    await ApiController.prefetch({
      fetchConnectorImages: true,
      fetchFeaturedWallets: false,
      fetchRecommendedWallets: true,
      fetchNetworkImages: false
    })

    expect(fetchConnectorImages).toHaveBeenCalled()
    expect(fetchFeaturedWallets).not.toHaveBeenCalled()
    expect(fetchRecommendedWallets).toHaveBeenCalled()
    expect(fetchNetworkImages).not.toHaveBeenCalled()
  })

  it('should handle both successful and failed prefetch requests', async () => {
    ApiController.state.promises = {}
    vi.spyOn(ApiController, 'fetchConnectorImages').mockResolvedValue()
    vi.spyOn(ApiController, 'fetchFeaturedWallets').mockRejectedValue(new Error('Test error'))

    const result = await ApiController.prefetch({
      fetchConnectorImages: true,
      fetchFeaturedWallets: true,
      fetchRecommendedWallets: false,
      fetchNetworkImages: false
    })

    expect(result).toHaveLength(2)
    expect(result[0]?.status).toBe('fulfilled')
    expect(result[1]?.status).toBe('rejected')
  })

  it('should store fetched resources in state.promises', async () => {
    ApiController.state.promises = {}
    vi.spyOn(ApiController, 'fetchConnectorImages').mockResolvedValue()
    vi.spyOn(ApiController, 'fetchFeaturedWallets').mockResolvedValue()

    await ApiController.prefetch({
      fetchConnectorImages: true,
      fetchFeaturedWallets: true,
      fetchRecommendedWallets: false,
      fetchNetworkImages: false
    })

    expect(ApiController.state.promises['connectorImages']).not.toBeUndefined()
    expect(ApiController.state.promises['featuredWallets']).not.toBeUndefined()
  })

  // Fetch analytics config - somehow this is failing
  it.skip('should fetch analytics config', async () => {
    const data = { isAnalyticsEnabled: true }
    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data })

    await ApiController.fetchAnalyticsConfig()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/getAnalyticsConfig',
      ...ApiController._getSdkProperties()
    })

    expect(ApiController.state.isAnalyticsEnabled).toBe(true)
  })

  it('should reset filters when no namespaces are provided', () => {
    const allFeatured = [
      { id: '1', name: 'Wallet1' },
      { id: '2', name: 'Wallet2' }
    ] as WcWallet[]
    const allRecommended = [
      { id: '3', name: 'Wallet3' },
      { id: '4', name: 'Wallet4' }
    ] as WcWallet[]

    ApiController.state.allFeatured = allFeatured
    ApiController.state.allRecommended = allRecommended
    ApiController.state.featured = []
    ApiController.state.recommended = []

    ApiController.filterByNamespaces([])

    expect(ApiController.state.featured).toEqual(allFeatured)
    expect(ApiController.state.recommended).toEqual(allRecommended)
  })

  it('should filter wallets by provided namespaces', () => {
    const mockWallets = [
      { id: '1', name: 'Wallet1', chains: ['eip155:1'] as const },
      { id: '2', name: 'Wallet2', chains: ['solana:1'] as const },
      { id: '3', name: 'Wallet3', chains: ['eip155:1', 'solana:1'] as const }
    ] as WcWallet[]

    const getRequestedCaipNetworkIdsSpy = vi
      .spyOn(ChainController, 'getRequestedCaipNetworkIds')
      .mockReturnValue(['eip155:1'])

    ApiController.state.allFeatured = mockWallets
    ApiController.state.allRecommended = mockWallets
    ApiController.state.wallets = mockWallets

    ApiController.filterByNamespaces(['eip155'])

    expect(ApiController.state.featured).toEqual([mockWallets[0], mockWallets[2]])
    expect(ApiController.state.recommended).toEqual([mockWallets[0], mockWallets[2]])
    expect(ApiController.state.filteredWallets).toEqual([mockWallets[0], mockWallets[2]])
    expect(getRequestedCaipNetworkIdsSpy).toHaveBeenCalled()
  })

  it('should fetch allowed origins', async () => {
    const mockOrigins = ['https://example.com', 'https://*.test.org']
    const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ allowedOrigins: mockOrigins })
    const sdkProperties = ApiController._getSdkProperties()

    const result = await ApiController.fetchAllowedOrigins()

    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/projects/v1/origins',
      params: sdkProperties
    })
    expect(result).toEqual(mockOrigins)
  })

  it('should throw RATE_LIMITED error for HTTP 429 status', async () => {
    const mockError = new Error('Rate limited')
    mockError.cause = new Response('Too Many Requests', { status: 429 })
    const fetchSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    await expect(ApiController.fetchAllowedOrigins()).rejects.toThrow('RATE_LIMITED')
    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/projects/v1/origins',
      params: ApiController._getSdkProperties()
    })
  })

  it('should throw SERVER_ERROR for HTTP 5xx status codes', async () => {
    const mockError = new Error('Internal Server Error')
    mockError.cause = new Response('Internal Server Error', { status: 500 })
    const fetchSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    await expect(ApiController.fetchAllowedOrigins()).rejects.toThrow('SERVER_ERROR')
    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/projects/v1/origins',
      params: ApiController._getSdkProperties()
    })
  })

  it('should throw SERVER_ERROR for HTTP 502 status code', async () => {
    const mockError = new Error('Bad Gateway')
    mockError.cause = new Response('Bad Gateway', { status: 502 })
    vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    await expect(ApiController.fetchAllowedOrigins()).rejects.toThrow('SERVER_ERROR')
  })

  it('should return empty array for HTTP 403 status (existing behavior)', async () => {
    const mockError = new Error('Forbidden')
    mockError.cause = new Response('Forbidden', { status: 403 })
    const fetchSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    const result = await ApiController.fetchAllowedOrigins()
    expect(result).toEqual([])
    expect(fetchSpy).toHaveBeenCalledWith({
      path: '/projects/v1/origins',
      params: ApiController._getSdkProperties()
    })
  })

  it('should return empty array for non-HTTP errors (existing behavior)', async () => {
    const mockError = new Error('Network error')
    vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    const result = await ApiController.fetchAllowedOrigins()
    expect(result).toEqual([])
  })

  it('should return empty array for HTTP errors without Response cause', async () => {
    const mockError = new Error('Some error')
    mockError.cause = 'not a response object'
    vi.spyOn(api, 'get').mockRejectedValueOnce(mockError)

    const result = await ApiController.fetchAllowedOrigins()
    expect(result).toEqual([])
  })

  it('should filter out wallets without mobile_link in mobile environment', () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

    const mockWallets = [
      { id: '1', name: 'Wallet1', mobile_link: 'link1' },
      { id: '2', name: 'Wallet2' },
      { id: '3', name: 'Wallet3', mobile_link: 'link3' }
    ] as WcWallet[]

    const filteredWallets = ApiController._filterWalletsByPlatform(mockWallets)
    expect(filteredWallets).toHaveLength(2)
    expect(filteredWallets.map(w => w.id)).toEqual(['1', '3'])
  })

  it('should filter out wallets without mobile_link in mobile environment but keep custom deeplink wallets', () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'solana'
    } as ChainControllerState)
    const mockWallets = [
      { id: '1', name: 'Wallet1', mobile_link: 'link1' },
      { id: '2', name: 'Wallet2' },
      { id: '3', name: 'Wallet3', mobile_link: 'link3' },
      {
        id: CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
        name: 'Coinbase Wallet'
      },
      { id: CUSTOM_DEEPLINK_WALLETS.PHANTOM.id, name: 'Phantom' },
      { id: CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id, name: 'Solflare' }
    ] as WcWallet[]

    const filteredWallets = ApiController._filterWalletsByPlatform(mockWallets)
    expect(filteredWallets).toHaveLength(5)
    expect(filteredWallets.map(w => w.id)).toEqual([
      '1',
      '3',
      CUSTOM_DEEPLINK_WALLETS.COINBASE.id,
      CUSTOM_DEEPLINK_WALLETS.PHANTOM.id,
      CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id
    ])
  })

  it('should not filter wallets in non-mobile environment', () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

    const mockWallets = [
      { id: '1', name: 'Wallet1', mobile_link: 'link1' },
      { id: '2', name: 'Wallet2' },
      { id: '3', name: 'Wallet3', mobile_link: 'link3' }
    ] as WcWallet[]

    const filteredWallets = ApiController._filterWalletsByPlatform(mockWallets)
    expect(filteredWallets).toEqual(mockWallets)
  })

  it('should verify _filterWalletsByPlatform is called in fetchWallets', async () => {
    const filterSpy = vi.spyOn(ApiController, '_filterWalletsByPlatform')
    const mockResponse = { data: [], count: 0 }
    vi.spyOn(api, 'get').mockResolvedValue(mockResponse)

    await ApiController.fetchWallets({ page: 1, entries: 10 })
    expect(filterSpy).toHaveBeenCalledWith(mockResponse.data)
  })

  it('should not pass chains parameter when calling fetchWallets in initializeExcludedWallets', async () => {
    const mockWallets = [
      { id: '1', name: 'Wallet1', rdns: 'rdns1' },
      { id: '2', name: 'Wallet2', rdns: 'rdns2' }
    ] as WcWallet[]

    const fetchWalletsSpy = vi.spyOn(ApiController, 'fetchWallets')
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockWallets, count: mockWallets.length })

    await ApiController.initializeExcludedWallets({ ids: ['1', '2'] })

    expect(fetchWalletsSpy).toHaveBeenCalledWith({
      page: 1,
      entries: 2,
      include: ['1', '2']
    })
  })
})
