import { describe, expect, it, vi } from 'vitest'

import { BlockchainApiController, FetchUtil } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('BlockchainApiController', () => {
  it('should include sdk properties when fetching blockchain data', async () => {
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
})
