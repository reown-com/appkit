import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { EstimateGasTransactionArgs } from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKitBaseClient } from '../../src/client/appkit-base-client.js'
import { mockEvmAdapter } from '../mocks/Adapter.js'
import { mainnet } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

class TestAppKit extends AppKitBaseClient {
  protected async injectModalUi(): Promise<void> {}
  public async syncIdentity(): Promise<void> {}

  // Expose protected connectionControllerClient for testing
  public get testConnectionControllerClient() {
    return this.connectionControllerClient
  }
}

describe('AppKit Gas Estimation', () => {
  let appKit: TestAppKit

  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    // Mock ChainController.initialize before creating TestAppKit
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => {})

    appKit = new TestAppKit(mockOptions)
  })

  it('should return estimated gas for EVM chain', async () => {
    const mockProvider = { provider: 'mock' }
    const mockGasEstimate = 21000n

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mainnet
    } as any)

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockResolvedValue({ gas: mockGasEstimate })

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      to: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      data: '0x' as `0x${string}`
    }

    const result = await appKit.testConnectionControllerClient?.estimateGas(transactionArgs)

    expect(ProviderUtil.getProvider).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(mockEvmAdapter.estimateGas).toHaveBeenCalledWith({
      ...transactionArgs,
      provider: mockProvider,
      caipNetwork: mainnet
    })
    expect(result).toBe(mockGasEstimate)
  })

  it('should return 0n for non-EVM chain', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.SOLANA,
      activeCaipNetwork: { id: '1', chainNamespace: ConstantsUtil.CHAIN.SOLANA }
    } as any)

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.SOLANA
    } as EstimateGasTransactionArgs

    const result = await appKit.testConnectionControllerClient?.estimateGas(transactionArgs)

    expect(mockEvmAdapter.estimateGas).not.toHaveBeenCalled()
    expect(result).toBe(0n)
  })

  it('should handle errors during gas estimation', async () => {
    const mockProvider = { provider: 'mock' }

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mainnet
    } as any)

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockRejectedValue(new Error('Gas estimation failed'))

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      to: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      data: '0x' as `0x${string}`
    }

    await expect(
      appKit.testConnectionControllerClient?.estimateGas(transactionArgs)
    ).rejects.toThrow('Gas estimation failed')
  })

  it('should throw error when CaipNetwork is undefined', async () => {
    const mockProvider = { provider: 'mock' }

    // Mock the getCaipNetwork method to return undefined
    vi.spyOn(appKit, 'getCaipNetwork').mockReturnValue(undefined)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: undefined
    } as any)

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)

    vi.spyOn(mockEvmAdapter, 'estimateGas').mockReset()

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      to: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      data: '0x' as `0x${string}`
    }

    await expect(
      appKit.testConnectionControllerClient?.estimateGas(transactionArgs)
    ).rejects.toThrow('CaipNetwork is undefined')
  })

  it('should handle missing adapter gracefully', async () => {
    const mockProvider = { provider: 'mock' }

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mainnet
    } as any)

    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockResolvedValue(undefined as any)

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      to: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      data: '0x' as `0x${string}`
    }

    const result = await appKit.testConnectionControllerClient?.estimateGas(transactionArgs)

    expect(result).toBe(0n)
  })
})
