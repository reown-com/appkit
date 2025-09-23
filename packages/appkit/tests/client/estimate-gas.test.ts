import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type Address, ConstantsUtil, type Hex } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ProviderController
} from '@reown/appkit-controllers'
import type { EstimateGasTransactionArgs } from '@reown/appkit-controllers'
import { mockChainControllerState } from '@reown/appkit-controllers/testing'

import { mockEvmAdapter } from '../mocks/Adapter.js'
import { mainnet } from '../mocks/Networks.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('AppKit Gas Estimation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
  })

  it('should return estimated gas for EVM chain', async () => {
    const mockProvider = { provider: 'mock' }
    const mockGasEstimate = 21000n

    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([[ConstantsUtil.CHAIN.EVM, {}]])
    })

    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockResolvedValue({ gas: mockGasEstimate })

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as Address,
      to: '0x1234567890123456789012345678901234567890' as Address,
      data: '0x' as Hex
    }

    const result = await ConnectionController.estimateGas(transactionArgs)

    expect(ProviderController.getProvider).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(mockEvmAdapter.estimateGas).toHaveBeenCalledWith({
      ...transactionArgs,
      provider: mockProvider,
      caipNetwork: mainnet
    })
    expect(result).toBe(mockGasEstimate)
  })

  it('should return 0n for non-EVM chain', async () => {
    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.SOLANA,
      chains: new Map([[ConstantsUtil.CHAIN.SOLANA, {}]])
    })

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.SOLANA
    } as EstimateGasTransactionArgs

    const result = await ConnectionController.estimateGas(transactionArgs)

    expect(mockEvmAdapter.estimateGas).not.toHaveBeenCalled()
    expect(result).toBe(0n)
  })

  it('should handle errors during gas estimation', async () => {
    const mockProvider = { provider: 'mock' }

    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([[ConstantsUtil.CHAIN.EVM, {}]])
    })

    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockRejectedValue(new Error('Gas estimation failed'))

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as Address,
      to: '0x1234567890123456789012345678901234567890' as Address,
      data: '0x' as Hex
    }

    await expect(ConnectionController.estimateGas(transactionArgs)).rejects.toThrow(
      'Gas estimation failed'
    )
  })

  it('should throw error when CaipNetwork is undefined', async () => {
    const mockProvider = { provider: 'mock' }

    // Mock the getCaipNetwork method to return undefined
    vi.spyOn(ChainController, 'getCaipNetwork').mockReturnValue(undefined)

    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([[ConstantsUtil.CHAIN.EVM, {}]])
    })

    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockReset()

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as Address,
      to: '0x1234567890123456789012345678901234567890' as Address,
      data: '0x' as Hex
    }

    await expect(ConnectionController.estimateGas(transactionArgs)).rejects.toThrow(
      'estimateGas: caipNetwork is required but got undefined'
    )
  })

  it('should handle missing adapter gracefully', async () => {
    const mockProvider = { provider: 'mock' }

    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([[ConstantsUtil.CHAIN.EVM, {}]])
    })

    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
    vi.spyOn(mockEvmAdapter, 'estimateGas').mockResolvedValue(undefined as any)

    const transactionArgs: EstimateGasTransactionArgs = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      address: '0x1234567890123456789012345678901234567890' as Address,
      to: '0x1234567890123456789012345678901234567890' as Address,
      data: '0x' as Hex
    }

    const result = await ConnectionController.estimateGas(transactionArgs)

    expect(result).toBe(0n)
  })
})
