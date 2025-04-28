import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { FetchUtil } from '@reown/appkit-blockchain-api'

import { BlockchainApiController, OptionsController } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('BlockchainApiController', () => {
  beforeAll(() => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project-id',
      sdkType: 'appkit',
      sdkVersion: 'html-wagmi-1.7.0'
    })
    BlockchainApiController.initializeClient()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should include sdk properties when fetching swap allowance data', async () => {
    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue({})
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)

    const swapAllowance = {
      tokenAddress: '0x123',
      userAddress: '0x456'
    }

    await BlockchainApiController.fetchSwapAllowance(swapAllowance)

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/v1/convert/allowance',
        params: {
          ...swapAllowance,
          sv: 'html-wagmi-1.7.0',
          st: 'appkit',
          projectId: 'test-project-id'
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
          sv: 'html-wagmi-1.7.0',
          st: 'appkit',
          projectId: 'test-project-id'
        }
      })
    )
  })
})
