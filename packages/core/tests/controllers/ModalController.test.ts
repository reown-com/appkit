import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiController, ModalController } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have valid default state', () => {
    expect(ModalController.state.open).toEqual(false)
  })

  // Skipping for now, need to figure out a way to test this with new prefetch check
  it.skip('should update state correctly on open()', () => {
    ModalController.open()
    expect(ModalController.state.open).toEqual(true)
  })

  it('should update state correctly on close()', () => {
    ModalController.close()
    expect(ModalController.state.open).toEqual(false)
  })

  it('should prefetch when open() is called', async () => {
    vi.spyOn(ApiController, 'fetchFeaturedWallets')
    vi.spyOn(ApiController, 'fetchRecommendedWallets')
    vi.spyOn(ApiController, 'fetchConnectorImages')
    vi.spyOn(ApiController, 'fetchNetworkImages')

    await ModalController.open()

    expect(ApiController.fetchFeaturedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchRecommendedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchConnectorImages).toHaveBeenCalledOnce()
    expect(ApiController.fetchNetworkImages).toHaveBeenCalledOnce()
  })
})
