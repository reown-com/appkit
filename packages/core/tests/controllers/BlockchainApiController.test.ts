import { describe, expect, it, vi } from 'vitest'

import { BlockchainApiController, FetchUtil } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('BlockchainApiController', () => {
  it('should include sdk properties when fetching swap allowance data', async () => {
    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue({})
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)

    const swapAllowance = {
      projectId: '123',
      tokenAddress: '0x123',
      userAddress: '0x456'
    }

    await BlockchainApiController.fetchSwapAllowance(swapAllowance)

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/v1/convert/allowance',
        params: {
          ...swapAllowance,
          ...BlockchainApiController.getSdkProperties()
        }
      })
    )
  })
  it('should include sdk properties when fetching identity data', async () => {
    const address = '0x123'
    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue({})
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)

    await BlockchainApiController.fetchIdentity({ address, caipNetworkId: 'eip155:1' })

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/v1/identity/${address}`,
        params: {
          ...BlockchainApiController.getSdkProperties()
        }
      })
    )
  })
})
