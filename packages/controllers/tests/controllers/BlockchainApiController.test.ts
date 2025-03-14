import { describe, expect, it, vi } from 'vitest'

import { BlockchainApiController, FetchUtil, OptionsController } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('BlockchainApiController', () => {
  it('should include sdk properties when fetching swap allowance data', async () => {
    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue({})
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)
    OptionsController.state.projectId = 'test-project-id'

    const swapAllowance = {
      tokenAddress: '0x123',
      userAddress: '0x456'
    }

    await BlockchainApiController.fetchSwapAllowance(swapAllowance)

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/v1/convert/allowance',
        params: {
          projectId: 'test-project-id',
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
    OptionsController.state.projectId = 'test-project-id'

    await BlockchainApiController.fetchIdentity({ address, caipNetworkId: 'eip155:1' })

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/v1/identity/${address}`,
        params: {
          projectId: 'test-project-id',
          ...BlockchainApiController.getSdkProperties()
        }
      })
    )
  })
})
