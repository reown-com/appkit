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
      signer: { type: 'key', data: { type: 'secp256k1', publicKey: '0x123456' } },
      permissions: [{ type: 'test', data: {} }],
      policies: []
    }
  })

  describe('validateRequest', () => {
    it('should not throw for a valid request', () => {
      expect(() => validateRequest(mockRequest)).not.toThrow()
    })

    it('should throw for invalid chainId type', () => {
      const invalidRequest = { ...mockRequest, chainId: 1 } as any
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_CHAIN_ID_TYPE)
    })

    it('should throw for invalid chainId format', () => {
      const invalidRequest = { ...mockRequest, chainId: '1' }
      expect(() => validateRequest(invalidRequest as any)).toThrow(
        ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT
      )
    })

    it('should throw for invalid expiry', () => {
      const invalidRequest = { ...mockRequest, expiry: -1 }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should throw for empty permissions array', () => {
      const invalidRequest = { ...mockRequest, permissions: [] }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS)
    })

    it('should throw for invalid policies type', () => {
      const invalidRequest = { ...mockRequest, policies: {} as any }
      expect(() => validateRequest(invalidRequest)).toThrow(ERROR_MESSAGES.INVALID_POLICIES)
    })

    it('should throw for null signer', () => {
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

  describe('validateSigner', () => {
    it('should not throw for valid single key signer', () => {
      const validKeySigner: Signer = {
        type: 'key',
        data: { type: 'secp256k1', publicKey: '0x123456' }
      }
      expect(() => validateSigner(validKeySigner)).not.toThrow()
    })

    it('should not throw for valid multi-key signer', () => {
      const validKeysSigner: Signer = {
        type: 'keys',
        data: { keys: [{ type: 'secp256k1', publicKey: '0xabcdef' }] }
      }
      expect(() => validateSigner(validKeysSigner)).not.toThrow()
    })

    it('should throw for key signer with invalid publicKey type', () => {
      const invalidKeySigner: Signer = {
        type: 'key',
        data: { type: 'secp256k1', publicKey: 123 } as any
      }
      expect(() => validateSigner(invalidKeySigner)).toThrow(ERROR_MESSAGES.INVALID_PUBLIC_KEY_TYPE)
    })

    it('should throw for key signer with invalid publicKey format', () => {
      const invalidKeySigner: Signer = {
        type: 'key',
        data: { type: 'secp256k1', publicKey: '123456' }
      } as any
      expect(() => validateSigner(invalidKeySigner)).toThrow(
        ERROR_MESSAGES.INVALID_PUBLIC_KEY_FORMAT
      )
    })

    it('should throw for keys signer with empty keys array', () => {
      const invalidKeysSigner: Signer = { type: 'keys', data: { keys: [] } }
      expect(() => validateSigner(invalidKeysSigner)).toThrow(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
    })

    it('should throw for unsupported signer type', () => {
      const unsupportedSigner: Signer = { type: 'unsupported', data: {} } as any
      expect(() => validateSigner(unsupportedSigner)).toThrow(
        ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE
      )
    })
  })
})
