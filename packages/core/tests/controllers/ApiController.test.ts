import { describe, expect, it, vi } from 'vitest'
import {
  ApiController,
  AssetController,
  ConnectorController,
  NetworkController
} from '../../index.js'
import { api } from '../../src/controllers/ApiController.js'

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      featured: [],
      recommended: [],
      wallets: [],
      search: [],
      isAnalyticsEnabled: false
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
      headers: ApiController._getApiHeaders()
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
      headers: ApiController._getApiHeaders()
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
      headers: ApiController._getApiHeaders()
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
      headers: ApiController._getApiHeaders()
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
      headers: ApiController._getApiHeaders()
    })

    // Cannot exactly recreate the object url
    expect(AssetController.state.tokenImages[symbol]).toMatch(/^blob:/u)
  })

  it('should fetch network images ', async () => {
    NetworkController.setRequestedCaipNetworks([
      {
        id: '155:1',
        name: 'Ethereum Mainnet',
        imageId: '12341'
      },
      {
        id: '155:4',
        name: 'Ethereum Rinkeby',
        imageId: '12342'
      },
      {
        id: '155:42',
        name: 'Ethereum Kovan'
      }
    ])
    const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue()
    await ApiController.fetchNetworkImages()

    // Does not call if imageId is not present
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should fetch network images', async () => {
    NetworkController.setRequestedCaipNetworks([
      {
        id: '155:1',
        name: 'Ethereum Mainnet',
        imageId: '12341'
      },
      {
        id: '155:4',
        name: 'Ethereum Rinkeby',
        imageId: '12342'
      },
      // Should not fetch this
      {
        id: '155:42',
        name: 'Ethereum Kovan'
      }
    ])
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
        type: 'INJECTED'
      },
      {
        id: '12341',
        name: 'RandomConnector',
        type: 'INJECTED'
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
})
