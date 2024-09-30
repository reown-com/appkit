import { describe, expect, it, beforeEach, vi } from 'vitest'
import { grantPermissions } from '../../src/smart-session/grantPermissions'
import {
  ChainController,
  ConnectionController,
  OptionsController,
  type ConnectionControllerClient
} from '@reown/appkit-core'
import { WalletConnectCosigner } from '../../src/smart-session/utils/WalletConnectCosigner'
import type { SmartSessionGrantPermissionsRequest } from '../../src/smart-session/utils/TypeUtils.js'
import {
  extractAddress,
  isValidSupportedCaipAddress,
  assertWalletGrantPermissionsResponse
} from '../../src/smart-session/helper/index.js'
import { donutContractAbi } from '../data/abi'
import { ERROR_MESSAGES } from '../../src/smart-session/schema'

vi.mock('@reown/appkit-core')
vi.mock('../../src/smart-session/utils/WalletConnectCosigner')

describe('grantPermissions', () => {
  let mockRequest: SmartSessionGrantPermissionsRequest
  const expiry = Date.now() + 1000
  beforeEach(() => {
    mockRequest = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: '0x1',
      expiry: expiry,
      signer: { type: 'key', data: { type: 'secp256k1', publicKey: '0x123456' } },
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: '0x2E65BAfA07238666c3b239E94F32DaD3cDD6498D',
            abi: donutContractAbi,
            functions: [
              {
                functionName: 'purchase'
              }
            ]
          }
        }
      ],
      policies: []
    }

    vi.resetAllMocks()
    vi.mocked(OptionsController.state).projectId = 'test-project-id'
    vi.mocked(ChainController.state).activeCaipAddress =
      'eip155:1:0x1234567890123456789012345678901234567890'

    vi.mocked(WalletConnectCosigner.prototype.addPermission).mockResolvedValue({
      pci: 'test-pci',
      key: {
        type: 'secp256k1',
        publicKey: '0xtest-key'
      }
    })

    vi.mocked(ConnectionController._getClient).mockReturnValue({
      grantPermissions: vi.fn().mockResolvedValue({
        permissions: [
          {
            type: 'contract-call',
            data: {
              address: '0x2E65BAfA07238666c3b239E94F32DaD3cDD6498D',
              abi: donutContractAbi,
              functions: [
                {
                  functionName: 'purchase'
                }
              ]
            }
          }
        ],
        signer: {
          type: 'keys',
          data: {
            keys: [
              { type: 'secp256k1', publicKey: '0xtest-key' },
              { type: 'secp256k1', publicKey: '0x123456' }
            ]
          }
        },
        context: '0xcontext',
        expiry: expiry,
        address: '0x1234567890123456789012345678901234567890',
        chainId: '0x1'
      })
    } as unknown as ConnectionControllerClient)

    vi.mocked(WalletConnectCosigner.prototype.activatePermissions).mockResolvedValue(undefined)
  })

  it('should successfully grant permissions and invoke required methods', async () => {
    const result = await grantPermissions(mockRequest)

    expect(result).toEqual({
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: '0x2E65BAfA07238666c3b239E94F32DaD3cDD6498D',
            abi: donutContractAbi,
            functions: [
              {
                functionName: 'purchase'
              }
            ]
          }
        }
      ],
      context: 'test-pci',
      expiry: expiry,
      address: '0x1234567890123456789012345678901234567890',
      chainId: '0x1'
    })
    expect(WalletConnectCosigner.prototype.addPermission).toHaveBeenCalledWith(
      'eip155:1:0x1234567890123456789012345678901234567890',
      mockRequest
    )
    expect(WalletConnectCosigner.prototype.activatePermissions).toHaveBeenCalled()
  })

  it('should throw an error for unsupported namespace', async () => {
    vi.mocked(ChainController.state).activeCaipAddress = undefined
    await expect(grantPermissions(mockRequest)).rejects.toThrow(
      ERROR_MESSAGES.UNSUPPORTED_NAMESPACE
    )
  })

  it('should throw an error when grantPermissions returns null', async () => {
    vi.mocked(ConnectionController._getClient).mockReturnValueOnce({
      grantPermissions: vi.fn().mockResolvedValue(null)
    } as unknown as ConnectionControllerClient)

    await expect(grantPermissions(mockRequest)).rejects.toThrow(ERROR_MESSAGES.NO_RESPONSE_RECEIVED)
  })

  it('should handle network errors', async () => {
    vi.mocked(WalletConnectCosigner.prototype.addPermission).mockRejectedValue(
      new Error('Network error')
    )
    await expect(grantPermissions(mockRequest)).rejects.toThrow('Network error')
  })

  it('should throw an error for invalid chainId format', async () => {
    const invalidRequest = { ...mockRequest, chainId: '1' } // chainId should start with '0x'
    await expect(grantPermissions(invalidRequest as any)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT
    )
  })

  it('should throw an error for invalid expiry', async () => {
    const invalidRequest = { ...mockRequest, expiry: -1 }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
  })

  it('should throw an error for empty permissions', async () => {
    const invalidRequest = { ...mockRequest, permissions: [] }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_PERMISSIONS
    )
  })

  it('should throw an error for invalid policies', async () => {
    const invalidRequest = { ...mockRequest, policies: {} as any }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_POLICIES_TYPE
    )
  })

  it('should throw an error for invalid signer', async () => {
    const invalidRequest = { ...mockRequest, signer: null as any }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow()
  })

  it('should throw an error for invalid signer type', async () => {
    const invalidRequest = { ...mockRequest, signer: { type: {}, data: {} } as any }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow()
  })

  it('should successfully update the signer in request for valid key signer', async () => {
    await grantPermissions(mockRequest)
    expect(mockRequest.signer).toEqual({
      type: 'keys',
      data: {
        keys: [
          { type: 'secp256k1', publicKey: '0xtest-key' },
          { type: 'secp256k1', publicKey: '0x123456' }
        ]
      }
    })
  })

  it('should not modify the signer in request if signer type is already "keys"', async () => {
    mockRequest.signer = {
      type: 'keys',
      data: { keys: [{ type: 'secp256k1', publicKey: '0xexisting-key' }] }
    }
    await grantPermissions(mockRequest)
    expect(mockRequest.signer).toEqual({
      type: 'keys',
      data: {
        keys: [
          { type: 'secp256k1', publicKey: '0xtest-key' },
          { type: 'secp256k1', publicKey: '0xexisting-key' }
        ]
      }
    })
  })

  it('should throw an error when WalletConnectCosigner addPermission fails', async () => {
    vi.mocked(WalletConnectCosigner.prototype.addPermission).mockRejectedValue(
      new Error('Cosigner error')
    )
    await expect(grantPermissions(mockRequest)).rejects.toThrow('Cosigner error')
  })

  it('should throw an error when ConnectionController grantPermissions fails', async () => {
    vi.mocked(ConnectionController._getClient).mockReturnValueOnce({
      grantPermissions: vi.fn().mockRejectedValue(new Error('Connection error'))
    } as unknown as ConnectionControllerClient)

    await expect(grantPermissions(mockRequest)).rejects.toThrow('Connection error')
  })

  it('should return undefined for an invalid address in extractAddress', () => {
    const invalidCaipAddress = 'eip155:1:invalid-address'
    const result = extractAddress(invalidCaipAddress)
    expect(result).toBeUndefined()
  })

  it('should return a valid 0x-prefixed address from extractAddress', () => {
    const validCaipAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
    const result = extractAddress(validCaipAddress)
    expect(result).toEqual('0x1234567890123456789012345678901234567890')
  })

  it('should return true for a valid CAIP address in isValidSupportedCaipAddress', () => {
    const validCaipAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
    const isValid = isValidSupportedCaipAddress(validCaipAddress)
    expect(isValid).toBe(true)
  })

  it('should return false for an invalid CAIP address in isValidSupportedCaipAddress', () => {
    const invalidCaipAddress = 'invalid:namespace:0x1234567890123456789012345678901234567890'
    const isValid = isValidSupportedCaipAddress(invalidCaipAddress)
    expect(isValid).toBe(false)
  })

  it('should throw an error for an invalid response in assertWalletGrantPermissionsResponse', () => {
    const invalidResponse = { invalid: 'data' }
    expect(() => assertWalletGrantPermissionsResponse(invalidResponse)).toThrow(
      ERROR_MESSAGES.INVALID_GRANT_PERMISSIONS_RESPONSE
    )
  })
})
