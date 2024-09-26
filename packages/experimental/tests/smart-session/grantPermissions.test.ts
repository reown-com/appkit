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
import { ERROR_MESSAGES } from '../../src/smart-session/helper/index.js'

vi.mock('@reown/appkit-core')
vi.mock('../../src/smart-session/utils/WalletConnectCosigner')

describe('grantPermissions', () => {
  let mockRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    mockRequest = {
      chainId: '0x1',
      expiry: 1234567890,
      signer: { type: 'wallet', data: {} },
      permissions: [{ type: 'test', data: {} }],
      policies: []
    }

    vi.resetAllMocks()
    vi.mocked(OptionsController.state).projectId = 'test-project-id'
    vi.mocked(ChainController.state).activeCaipAddress =
      'eip155:1:0x1234567890123456789012345678901234567890'

    vi.mocked(ConnectionController._getClient).mockReturnValue({
      grantPermissions: vi.fn().mockResolvedValue({
        permissions: [{ type: 'test', data: {} }],
        context: '0xcontext'
      })
    } as unknown as ConnectionControllerClient)

    vi.mocked(WalletConnectCosigner.prototype.addPermission).mockResolvedValue({
      pci: 'test-pci',
      key: {
        type: 'secp256k1',
        publicKey: '0xtest-key'
      }
    })
    vi.mocked(WalletConnectCosigner.prototype.activatePermissions).mockResolvedValue(undefined)
  })

  it('should successfully grant permissions and invoke required methods', async () => {
    const result = await grantPermissions(mockRequest)

    expect(result).toEqual({
      permissions: [{ type: 'test', data: {} }],
      context: 'test-pci'
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
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(ERROR_MESSAGES.INVALID_POLICIES)
  })

  it('should throw an error for invalid signer', async () => {
    const invalidRequest = { ...mockRequest, signer: null as any }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(ERROR_MESSAGES.INVALID_SIGNER)
  })

  it('should throw an error for invalid signer type', async () => {
    const invalidRequest = { ...mockRequest, signer: { type: {}, data: {} } as any }
    await expect(grantPermissions(invalidRequest)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_SIGNER_TYPE
    )
  })
})
