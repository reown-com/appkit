import { describe, expect, it, beforeEach } from 'vitest'
import type {
  Signer,
  SmartSessionGrantPermissionsRequest
} from '../../src/smart-session/utils/TypeUtils.js'
import {
  ERROR_MESSAGES,
  validateRequest,
  validateSigner
} from '../../src/smart-session/helper/index.js'

describe('smart-session/helper', () => {
  let mockRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    mockRequest = {
      chainId: '0x1',
      expiry: 1234567890,
      signer: { type: 'wallet', data: {} },
      permissions: [{ type: 'test', data: {} }],
      policies: []
    }
  })

  describe('validateSigner', () => {
    it('should not throw for valid wallet signer', () => {
      const signer: Signer = { type: 'wallet', data: {} }
      expect(() => validateSigner(signer)).not.toThrow()
    })

    it('should throw for invalid key signer', () => {
      const invalidKeySigner: Signer = { type: 'key', data: { type: 'secp256k1' } as any }
      expect(() => validateSigner(invalidKeySigner)).toThrow(ERROR_MESSAGES.INVALID_KEY_SIGNER)
    })

    it('should throw for invalid keys signer', () => {
      const invalidKeysSigner: Signer = { type: 'keys', data: { keys: [] } }
      expect(() => validateSigner(invalidKeysSigner)).toThrow(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
    })

    it('should throw for invalid account signer', () => {
      const invalidAccountSigner: Signer = { type: 'account', data: {} as any }
      expect(() => validateSigner(invalidAccountSigner)).toThrow(
        ERROR_MESSAGES.INVALID_ACCOUNT_SIGNER
      )
    })

    it('should throw for unsupported signer type', () => {
      const unsupportedSigner = { type: 'unsupported', data: {} } as unknown as Signer
      expect(() => validateSigner(unsupportedSigner)).toThrow(
        ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE
      )
    })
  })

  describe('validateRequest', () => {
    it('should not throw for valid request', () => {
      expect(() => validateRequest(mockRequest)).not.toThrow()
    })

    it('should throw for invalid chainId type', () => {
      const invalidRequest = { ...mockRequest, chainId: 1 }
      expect(() => validateRequest(invalidRequest as any)).toThrow(
        ERROR_MESSAGES.INVALID_CHAIN_ID_TYPE
      )
    })

    it('should throw for invalid chainId format', () => {
      const invalidRequest = { ...mockRequest, chainId: '1' } as any
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT)
    })

    it('should throw for invalid expiry', () => {
      const invalidRequest = { ...mockRequest, expiry: -1 } as any
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should throw for empty permissions', () => {
      const invalidRequest = { ...mockRequest, permissions: [] }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS)
    })

    it('should throw for invalid policies', () => {
      const invalidRequest = { ...mockRequest, policies: {} as any }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_POLICIES)
    })

    it('should throw for invalid signer', () => {
      const invalidRequest = { ...mockRequest, signer: null as any }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_SIGNER)
    })

    it('should throw for invalid signer type', () => {
      const invalidRequest = { ...mockRequest, signer: { type: 'invalid', data: {} } }
      expect(() => validateRequest(invalidRequest as any)).toThrow(
        ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE
      )
    })
  })
})
