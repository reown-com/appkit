import { describe, expect, it, vi } from 'vitest'
import { ApiController } from '../../controllers/ApiController'
import { HelpersUtil } from '../utils/HelperUtil'

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state.walletButtons).toStrictEqual([])
    expect(ApiController.state.fetching).toStrictEqual(false)
  })

  it('should subscribe to event', async () => {
    const subscribeKeyFnSpy = vi.fn()
    ApiController.subscribeKey('walletButtons', subscribeKeyFnSpy)

    ApiController.state.walletButtons = [{ id: '1', name: 'Wallet 1' }]

    await HelpersUtil.sleep(200)

    expect(subscribeKeyFnSpy).toHaveBeenCalledWith([{ id: '1', name: 'Wallet 1' }])
  })
})
