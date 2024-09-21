import { describe, expect, it, beforeEach, vi } from 'vitest'
import { AppKitSmartSessionControllerClient, ERROR_MESSAGES } from '../src/client.js'
import {
  ChainController,
  ConnectionController,
  OptionsController,
  type ConnectionControllerClient
} from '@reown/appkit-core'
import { WalletConnectCosigner } from '../src/core/utils/WalletConnectCosigner'
import { KeyTypes } from '../src/core/helper/index.js'
import type { Signer, SmartSessionGrantPermissionsRequest } from '../src/core/utils/TypeUtils.js'

vi.mock('@reown/appkit-core')
vi.mock('../src/core/utils/WalletConnectCosigner')

describe('AppKitSmartSessionControllerClient', () => {
  let client: AppKitSmartSessionControllerClient
  let mockRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    client = new AppKitSmartSessionControllerClient()
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
      key: '0xtest-key'
    })
    vi.mocked(WalletConnectCosigner.prototype.activatePermissions).mockResolvedValue(undefined)
  })

  describe('grantPermissions', () => {
    it('should successfully grant permissions and invoke required methods', async () => {
      const result = await client.grantPermissions(mockRequest)

      expect(result).toEqual({
        permissions: [{ type: 'test', data: {} }],
        context: '0xcontext'
      })
      expect(WalletConnectCosigner.prototype.addPermission).toHaveBeenCalledWith(
        'eip155:1:0x1234567890123456789012345678901234567890',
        mockRequest
      )
      expect(WalletConnectCosigner.prototype.activatePermissions).toHaveBeenCalled()
    })

    it('should throw an error for unsupported namespace', async () => {
      vi.mocked(ChainController.state).activeCaipAddress = undefined
      await expect(client.grantPermissions(mockRequest)).rejects.toThrow(
        ERROR_MESSAGES.UNSUPPORTED_NAMESPACE
      )
    })

    it('should throw an error when grantPermissions returns null', async () => {
      vi.mocked(ConnectionController._getClient).mockReturnValueOnce({
        grantPermissions: vi.fn().mockResolvedValue(null)
      } as unknown as ConnectionControllerClient)

      await expect(client.grantPermissions(mockRequest)).rejects.toThrow(
        ERROR_MESSAGES.NO_RESPONSE_RECEIVED
      )
    })

    it('should handle network errors', async () => {
      vi.mocked(WalletConnectCosigner.prototype.addPermission).mockRejectedValue(
        new Error('Network error')
      )
      await expect(client.grantPermissions(mockRequest)).rejects.toThrow('Network error')
    })

    it('should throw an error for invalid chainId format', async () => {
      const invalidRequest = { ...mockRequest, chainId: '1' } // chainId should start with '0x'
      await expect(client.grantPermissions(invalidRequest as any)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT
      )
    })

    it('should throw an error for invalid expiry', async () => {
      const invalidRequest = { ...mockRequest, expiry: -1 }
      await expect(client.grantPermissions(invalidRequest)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_EXPIRY
      )
    })

    it('should throw an error for empty permissions', async () => {
      const invalidRequest = { ...mockRequest, permissions: [] }
      await expect(client.grantPermissions(invalidRequest)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_PERMISSIONS
      )
    })

    it('should throw an error for invalid policies', async () => {
      const invalidRequest = { ...mockRequest, policies: {} as any }
      await expect(client.grantPermissions(invalidRequest)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_POLICIES
      )
    })

    it('should throw an error for invalid signer', async () => {
      const invalidRequest = { ...mockRequest, signer: null as any }
      await expect(client.grantPermissions(invalidRequest)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_SIGNER
      )
    })

    it('should throw an error for invalid signer type', async () => {
      const invalidRequest = { ...mockRequest, signer: { type: {}, data: {} } as any }
      await expect(client.grantPermissions(invalidRequest)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_SIGNER_TYPE
      )
    })
  })

  describe('private methods', () => {
    it('getCosignerKey should return the correct key object', () => {
      const result = client['getCosignerKey']('0xtest-key')
      expect(result).toEqual({ type: KeyTypes.secp256k1, publicKey: '0xtest-key' })
    })

    it('updateRequestSigner should correctly update the signer for key type', () => {
      const request: SmartSessionGrantPermissionsRequest = {
        ...mockRequest,
        signer: { type: 'key', data: { type: 'secp256k1', publicKey: '0xdapp-key' } }
      }
      const cosignerKey = { type: KeyTypes.secp256k1, publicKey: '0xcosigner-key' as `0x${string}` }

      client['updateRequestSigner'](request, cosignerKey)

      expect(request.signer).toEqual({
        type: 'keys',
        data: { keys: [cosignerKey, { type: 'secp256k1', publicKey: '0xdapp-key' }] }
      })
    })

    describe('validateSigner', () => {
      it('should not throw for valid wallet signer', () => {
        const signer: Signer = { type: 'wallet', data: {} }
        expect(() => client['validateSigner'](signer)).not.toThrow()
      })

      it('should throw for invalid key signer', () => {
        const invalidKeySigner: Signer = { type: 'key', data: { type: 'secp256k1' } as any }
        expect(() => client['validateSigner'](invalidKeySigner)).toThrow(
          ERROR_MESSAGES.INVALID_KEY_SIGNER
        )
      })

      it('should throw for invalid keys signer', () => {
        const invalidKeysSigner: Signer = { type: 'keys', data: { keys: [] } }
        expect(() => client['validateSigner'](invalidKeysSigner)).toThrow(
          ERROR_MESSAGES.INVALID_KEYS_SIGNER
        )
      })

      it('should throw for invalid account signer', () => {
        const invalidAccountSigner: Signer = { type: 'account', data: {} as any }
        expect(() => client['validateSigner'](invalidAccountSigner)).toThrow(
          ERROR_MESSAGES.INVALID_ACCOUNT_SIGNER
        )
      })

      it('should throw for unsupported signer type', () => {
        const unsupportedSigner = { type: 'unsupported', data: {} } as unknown as Signer
        expect(() => client['validateSigner'](unsupportedSigner)).toThrow(
          ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE
        )
      })
    })
  })
})
