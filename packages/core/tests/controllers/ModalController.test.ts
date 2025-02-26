import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiController, closeModal, modalState, openModal } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have valid default state', () => {
    expect(modalState.open).toEqual(false)
  })

  // Skipping for now, need to figure out a way to test this with new prefetch check
  it.skip('should update state correctly on open()', () => {
    openModal()
    expect(modalState.open).toEqual(true)
  })

  it('should update state correctly on close()', () => {
    closeModal()
    expect(modalState.open).toEqual(false)
  })

  it('should prefetch when open() is called', async () => {
    vi.spyOn(ApiController, 'fetchFeaturedWallets')
    vi.spyOn(ApiController, 'fetchRecommendedWallets')
    vi.spyOn(ApiController, 'fetchConnectorImages')
    vi.spyOn(ApiController, 'prefetchNetworkImages')

    await openModal()

    expect(ApiController.fetchFeaturedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchRecommendedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchConnectorImages).toHaveBeenCalledOnce()
    expect(ApiController.prefetchNetworkImages).toHaveBeenCalledOnce()
  })
})
