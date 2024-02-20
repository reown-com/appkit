import { describe, expect, it, vi } from 'vitest'
import { ApiController, AssetController } from '../../index.js'
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
    expect(AssetController.state.networkImages[imageId]).toMatch(/^blob:/u)
  })
})
