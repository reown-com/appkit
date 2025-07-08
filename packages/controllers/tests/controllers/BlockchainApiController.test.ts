import { describe, expect, it, vi } from 'vitest'

import {
  BlockchainApiController,
  FetchUtil,
  OptionsController,
  StorageUtil
} from '../../exports/index.js'

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

  it('should return empty array if supported chains are not fetched', async () => {
    vi.spyOn(FetchUtil.prototype, 'get').mockRejectedValue(new Error('Not implemented'))
    const supportedChains = await BlockchainApiController.getSupportedNetworks()
    expect(supportedChains).toEqual({
      http: [],
      ws: []
    })
  })

  it('should call API when there is no cache for balance', async () => {
    const address = '0x123'
    const chainId = 'eip155:1'
    const mockBalance = { balances: [] }

    vi.spyOn(FetchUtil.prototype, 'get').mockResolvedValue(mockBalance)
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)
    vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(undefined)
    vi.spyOn(StorageUtil, 'updateBalanceCache').mockImplementation(() => {})
    OptionsController.state.projectId = 'test-project-id'

    await BlockchainApiController.getBalance(address, chainId)

    expect(FetchUtil.prototype.get).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/v1/account/${address}/balance`,
        params: {
          currency: 'usd',
          chainId,
          forceUpdate: undefined,
          projectId: 'test-project-id',
          st: 'appkit',
          sv: 'html-wagmi-undefined'
        }
      })
    )
  })

  it('should not call API when there is cache for balance', async () => {
    const address = '0x123'
    const chainId = 'eip155:1'
    const cachedBalance = { balances: [] }

    vi.spyOn(FetchUtil.prototype, 'get')
    vi.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true)
    vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(cachedBalance)
    OptionsController.state.projectId = 'test-project-id'

    const result = await BlockchainApiController.getBalance(address, chainId)

    expect(FetchUtil.prototype.get).not.toHaveBeenCalled()
    expect(result).toEqual(cachedBalance)
  })
})
