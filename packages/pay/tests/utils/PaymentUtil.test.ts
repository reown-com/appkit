import { beforeEach, describe, expect, test, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil, erc20ABI } from '@reown/appkit-common'
import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-controllers'

import { AppKitPayError, AppKitPayErrorCodes } from '../../src/types/errors'
import type { PaymentAsset } from '../../src/types/options.js'
import {
  ensureCorrectNetwork,
  processEvmErc20Payment,
  processEvmNativePayment
} from '../../src/utils/PaymentUtil'

// --- Mocks -------------------------------------------------------------------
vi.mock('@reown/appkit-controllers', () => ({
  ChainController: {
    switchActiveNetwork: vi.fn(),
    getNetworkProp: vi.fn()
  },
  ConnectionController: {
    parseUnits: vi.fn((amount: string, decimals: number) =>
      BigInt(parseFloat(amount) * 10 ** decimals)
    ),
    sendTransaction: vi.fn(),
    writeContract: vi.fn()
  },
  CoreHelperUtil: {
    sortRequestedNetworks: vi.fn()
  }
}))

// --- Test Data ---------------------------------------------------------------
const MOCK_EVM_NETWORK: CaipNetwork = {
  caipNetworkId: 'eip155:1',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  rpcUrls: { default: { http: ['http://example.com:8545'] } },
  id: '1',
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
}

const MOCK_OTHER_EVM_NETWORK: CaipNetwork = {
  caipNetworkId: 'eip155:137',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  rpcUrls: { default: { http: ['http://example:8546'] } },
  id: '137',
  name: 'Polygon',
  nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 }
}

const MOCK_FROM_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`
const MOCK_RECIPIENT_ADDRESS = '0xabcdef1234567890abcdef1234567890abcdef12' as `0x${string}`
const MOCK_TOKEN_ADDRESS = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' as `0x${string}`
const MOCK_NATIVE_AMOUNT = 1.5
const MOCK_ERC20_AMOUNT = 100.5

// --- Tests -------------------------------------------------------------------
describe('PaymentUtil', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // --- ensureCorrectNetwork Tests --------------------------------------------
  describe('ensureCorrectNetwork', () => {
    test('should return if network is already correct', async () => {
      const options = {
        paymentAssetNetwork: MOCK_EVM_NETWORK.caipNetworkId,
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [MOCK_EVM_NETWORK.caipNetworkId],
        requestedCaipNetworks: [MOCK_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([MOCK_EVM_NETWORK])

      await expect(ensureCorrectNetwork(options)).resolves.toBeUndefined()
      expect(ChainController.switchActiveNetwork).not.toHaveBeenCalled()
    })

    test('should switch network if different but allowed', async () => {
      const options = {
        paymentAssetNetwork: MOCK_OTHER_EVM_NETWORK.caipNetworkId,
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [
          MOCK_EVM_NETWORK.caipNetworkId,
          MOCK_OTHER_EVM_NETWORK.caipNetworkId
        ],
        requestedCaipNetworks: [MOCK_EVM_NETWORK, MOCK_OTHER_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([
        MOCK_EVM_NETWORK,
        MOCK_OTHER_EVM_NETWORK
      ])
      vi.mocked(ChainController.getNetworkProp).mockReturnValue(false) // Assume doesn't support all networks

      await ensureCorrectNetwork(options)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(MOCK_OTHER_EVM_NETWORK)
    })

    test('should switch network if different and supportsAllNetworks is true', async () => {
      const options = {
        paymentAssetNetwork: MOCK_OTHER_EVM_NETWORK.caipNetworkId,
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [MOCK_EVM_NETWORK.caipNetworkId], // Target network not explicitly approved
        requestedCaipNetworks: [MOCK_EVM_NETWORK, MOCK_OTHER_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([
        MOCK_EVM_NETWORK,
        MOCK_OTHER_EVM_NETWORK
      ])
      vi.mocked(ChainController.getNetworkProp).mockReturnValue(true) // Assume supports all networks

      await ensureCorrectNetwork(options)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(MOCK_OTHER_EVM_NETWORK)
    })

    test('should throw if payment asset network not found', async () => {
      const options = {
        paymentAssetNetwork: 'eip155:unknown',
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [MOCK_EVM_NETWORK.caipNetworkId],
        requestedCaipNetworks: [MOCK_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([MOCK_EVM_NETWORK])

      await expect(ensureCorrectNetwork(options)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
      )
    })

    test('should throw if network switch is needed but not allowed', async () => {
      const options = {
        paymentAssetNetwork: MOCK_OTHER_EVM_NETWORK.caipNetworkId,
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [MOCK_EVM_NETWORK.caipNetworkId], // Other network not approved
        requestedCaipNetworks: [MOCK_EVM_NETWORK, MOCK_OTHER_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([
        MOCK_EVM_NETWORK,
        MOCK_OTHER_EVM_NETWORK
      ])
      vi.mocked(ChainController.getNetworkProp).mockReturnValue(false) // Doesn't support all networks

      await expect(ensureCorrectNetwork(options)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
      )
    })

    test('should throw generic error if switch fails', async () => {
      const switchError = new Error('Switch failed')
      const options = {
        paymentAssetNetwork: MOCK_OTHER_EVM_NETWORK.caipNetworkId,
        activeCaipNetwork: MOCK_EVM_NETWORK,
        approvedCaipNetworkIds: [
          MOCK_EVM_NETWORK.caipNetworkId,
          MOCK_OTHER_EVM_NETWORK.caipNetworkId
        ],
        requestedCaipNetworks: [MOCK_EVM_NETWORK, MOCK_OTHER_EVM_NETWORK]
      }
      vi.mocked(CoreHelperUtil.sortRequestedNetworks).mockReturnValue([
        MOCK_EVM_NETWORK,
        MOCK_OTHER_EVM_NETWORK
      ])
      vi.mocked(ChainController.getNetworkProp).mockReturnValue(false)
      vi.mocked(ChainController.switchActiveNetwork).mockRejectedValue(switchError)

      await expect(ensureCorrectNetwork(options)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR, switchError)
      )
    })
  })

  // --- processEvmNativePayment Tests -----------------------------------------
  describe('processEvmNativePayment', () => {
    const paymentAsset: PaymentAsset = {
      asset: 'native' as const,
      network: MOCK_EVM_NETWORK.caipNetworkId,
      metadata: { name: 'Ether', symbol: 'ETH', decimals: 18 }
    }
    const nativePaymentParams = {
      fromAddress: MOCK_FROM_ADDRESS,
      recipient: MOCK_RECIPIENT_ADDRESS,
      amount: MOCK_NATIVE_AMOUNT
    }

    test('should send native EVM transaction successfully', async () => {
      const mockTxHash = '0xtxhash123'
      const expectedAmountBigInt = BigInt(MOCK_NATIVE_AMOUNT * 10 ** paymentAsset.metadata.decimals)
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(expectedAmountBigInt)
      vi.mocked(ConnectionController.sendTransaction).mockResolvedValue(mockTxHash)

      const txHash = await processEvmNativePayment(
        paymentAsset,
        ConstantsUtil.CHAIN.EVM,
        nativePaymentParams
      )

      expect(ConnectionController.parseUnits).toHaveBeenCalledWith(
        MOCK_NATIVE_AMOUNT.toString(),
        paymentAsset.metadata.decimals
      )
      expect(ConnectionController.sendTransaction).toHaveBeenCalledWith({
        chainNamespace: ConstantsUtil.CHAIN.EVM,
        to: MOCK_RECIPIENT_ADDRESS,
        address: MOCK_FROM_ADDRESS,
        value: expectedAmountBigInt,
        data: '0x'
      })
      expect(txHash).toBe(mockTxHash)
    })

    test('should use default decimals (18) if metadata is missing', async () => {
      const paymentAssetNoMeta = { ...paymentAsset, metadata: undefined } as any
      const mockTxHash = '0xtxhash456'
      const expectedAmountBigInt = BigInt(MOCK_NATIVE_AMOUNT * 10 ** 18)
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(expectedAmountBigInt)
      vi.mocked(ConnectionController.sendTransaction).mockResolvedValue(mockTxHash)

      await processEvmNativePayment(
        paymentAssetNoMeta,
        ConstantsUtil.CHAIN.EVM,
        nativePaymentParams
      )

      expect(ConnectionController.parseUnits).toHaveBeenCalledWith(
        MOCK_NATIVE_AMOUNT.toString(),
        18
      )
      expect(ConnectionController.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ value: expectedAmountBigInt })
      )
    })

    test('should throw if parsed amount is not bigint', async () => {
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(undefined as any)

      await expect(
        processEvmNativePayment(paymentAsset, ConstantsUtil.CHAIN.EVM, nativePaymentParams)
      ).rejects.toThrow(new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR))

      vi.mocked(ConnectionController.parseUnits).mockImplementation(
        (amount: string, decimals: number) => BigInt(parseFloat(amount) * 10 ** decimals)
      )
    })

    test('should throw if chain namespace is not EVM', async () => {
      await expect(
        processEvmNativePayment(paymentAsset, ConstantsUtil.CHAIN.SOLANA, nativePaymentParams)
      ).rejects.toThrow(new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE))
    })

    test('should return undefined if sendTransaction returns undefined', async () => {
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(
        BigInt(MOCK_NATIVE_AMOUNT * 10 ** 18)
      )
      vi.mocked(ConnectionController.sendTransaction).mockResolvedValue(undefined)

      const txHash = await processEvmNativePayment(
        paymentAsset,
        ConstantsUtil.CHAIN.EVM,
        nativePaymentParams
      )

      expect(txHash).toBeUndefined()
    })
  })

  // --- processEvmErc20Payment Tests ------------------------------------------
  describe('processEvmErc20Payment', () => {
    const paymentAsset: PaymentAsset = {
      asset: MOCK_TOKEN_ADDRESS,
      network: MOCK_EVM_NETWORK.caipNetworkId,
      metadata: { name: 'USDC', symbol: 'USDC', decimals: 6 }
    }
    const erc20PaymentParams = {
      fromAddress: MOCK_FROM_ADDRESS,
      recipient: MOCK_RECIPIENT_ADDRESS,
      amount: MOCK_ERC20_AMOUNT
    }
    const expectedAmountBigInt = BigInt(
      MOCK_ERC20_AMOUNT * 10 ** (paymentAsset.metadata.decimals || 0)
    )

    test('should write ERC20 transfer contract successfully', async () => {
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(expectedAmountBigInt)

      await processEvmErc20Payment(paymentAsset, erc20PaymentParams)

      expect(ConnectionController.parseUnits).toHaveBeenCalledWith(
        MOCK_ERC20_AMOUNT.toString(),
        paymentAsset.metadata.decimals
      )

      expect(ConnectionController.writeContract).toHaveBeenCalledWith({
        fromAddress: MOCK_FROM_ADDRESS,
        tokenAddress: MOCK_TOKEN_ADDRESS,
        args: [MOCK_RECIPIENT_ADDRESS, expectedAmountBigInt],
        method: 'transfer',
        abi: erc20ABI,
        chainNamespace: ConstantsUtil.CHAIN.EVM
      })
    })

    test('should throw if parsed amount is not bigint', async () => {
      vi.mocked(ConnectionController.parseUnits).mockReturnValue(undefined as any)

      await expect(processEvmErc20Payment(paymentAsset, erc20PaymentParams)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR)
      )

      vi.mocked(ConnectionController.parseUnits).mockImplementation(
        (amount: string, decimals: number) => BigInt(parseFloat(amount) * 10 ** decimals)
      )
    })
  })
})
