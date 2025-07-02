import { beforeEach, describe, expect, it } from 'vitest'

import type { Address, Hex } from '@reown/appkit-common'

import type { SmartSessionGrantPermissionsRequest } from '../../../exports/smart-session/index.js'
import { validateRequest } from '../../../src/smart-session/helper/index.js'
import { ERROR_MESSAGES } from '../../../src/smart-session/schema/index.js'
import type { MultiKeySigner } from '../../../src/smart-session/utils/TypeUtils.js'
import { donutContractAbi } from '../../data/abi.js'
import { mockRequest } from './mockRequest.js'

describe('Common field validation', () => {
  let testRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    testRequest = {
      ...mockRequest(),
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
      ]
    }
  })

  it('should pass for a valid request', () => {
    expect(() => validateRequest(testRequest)).not.toThrow()
  })

  it('should fail for missing chainId', () => {
    const { chainId, ...requestWithoutChainId } = testRequest
    expect(() => validateRequest(requestWithoutChainId as any)).toThrow('Invalid chainId: Required')
  })

  describe('ChainIdSchema Validation', () => {
    it('should pass for valid chainId', () => {
      const request = { ...testRequest, chainId: '0x1' as Hex }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it.each([
      [null, 'null'],
      [undefined, 'undefined'],
      [123, 'number'],
      [{}, 'object'],
      [[], 'array'],
      ['', 'empty string'],
      ['123456', 'string without 0x prefix'],
      ['0x', 'only 0x'],
      ['0xZZZZZZ', 'invalid hexadecimal']
    ])('should fail for %s chainId', (chainId, _description) => {
      const request = { ...testRequest, chainId }
      if (chainId === undefined) {
        const { chainId, ...requestWithoutChainId } = request
        expect(() => validateRequest(requestWithoutChainId as any)).toThrow(/Invalid chainId/)
      } else {
        expect(() => validateRequest(request as any)).toThrow(/Invalid chainId/)
      }
    })

    it('should handle chainIds with leading zeros', () => {
      const request = { ...testRequest, chainId: '0x01' as Hex }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should be case insensitive for hex characters', () => {
      const request1 = { ...testRequest, chainId: '0xaB1' as Hex }
      const request2 = { ...testRequest, chainId: '0xAb1' as Hex }
      expect(() => validateRequest(request1)).not.toThrow()
      expect(() => validateRequest(request2)).not.toThrow()
    })
  })

  describe('Address field validation', () => {
    it('should pass for valid Ethereum address', () => {
      const request = {
        ...testRequest,
        address: '0x1234567890123456789012345678901234567890' as Address
      }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should pass when address is omitted', () => {
      const { address, ...requestWithoutAddress } = testRequest
      expect(() => validateRequest(requestWithoutAddress)).not.toThrow()
    })

    it('should fail for address not starting with 0x', () => {
      const request = {
        ...testRequest,
        address: '1234567890123456789012345678901234567890' as Address
      }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
    })

    it('should fail for empty string address', () => {
      const request = { ...testRequest, address: '' as any }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
    })

    it('should fail for non-string address', () => {
      const request = { ...testRequest, address: 123 as any }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
    })

    it('should fail for null address', () => {
      const request = { ...testRequest, address: null as any }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
    })

    it('should fail for undefined address', () => {
      const request = { ...testRequest, address: undefined }
      expect(() => validateRequest(request)).not.toThrow() // Because it's optional
    })

    it('should be case insensitive for hex characters', () => {
      const request = { ...testRequest, address: ('0xAbCd' + '0'.repeat(36)) as Address }
      expect(() => validateRequest(request)).not.toThrow()
    })

    // TODO:
    // Should fail for address shorter than 42 characters
    // Should fail for address longer than 42 characters
    // Should fail for address with spaces'
  })

  describe('Expiry field validation', () => {
    const currentTimestamp = Math.floor(Date.now() / 1000)

    it('should pass for a valid future expiry', () => {
      const request = { ...testRequest, expiry: currentTimestamp + 3600 } // 1 hour in the future
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should fail for a negative expiry', () => {
      const request = { ...testRequest, expiry: -1 }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should fail for a zero expiry', () => {
      const request = { ...testRequest, expiry: 0 }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should fail for a past expiry', () => {
      const request = { ...testRequest, expiry: currentTimestamp - 3600 } // 1 hour in the past
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should fail for a current timestamp expiry', () => {
      const request = { ...testRequest, expiry: currentTimestamp }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
    })

    it('should fail for a non-number expiry', () => {
      const request = { ...testRequest, expiry: '1234567890' as any }
      expect(() => validateRequest(request)).toThrow(
        'Invalid expiry: Expected number, received string'
      )
    })

    it('should fail for an undefined expiry', () => {
      const { expiry, ...requestWithoutExpiry } = testRequest
      expect(() => validateRequest(requestWithoutExpiry as any)).toThrow('Invalid expiry: Required')
    })

    it('should fail for a null expiry', () => {
      const request = { ...testRequest, expiry: null as any }
      expect(() => validateRequest(request)).toThrow(
        'Invalid expiry: Expected number, received null'
      )
    })

    it('should pass for an expiry 1 hour in the future', () => {
      const request = { ...testRequest, expiry: currentTimestamp + 3600 }
      expect(() => validateRequest(request)).not.toThrow()
    })
  })

  describe('Signer field validation', () => {
    it('should fail for unsupported signer', () => {
      const request = {
        ...testRequest,
        signer: {
          type: 'key',
          data: { type: 'secp256k1', publicKey: '0x1234567890abcdef' as Address }
        } as any
      }
      expect(() => validateRequest(request)).toThrow()
    })

    it('should pass for valid multi-key signer', () => {
      const request = {
        ...testRequest,
        signer: {
          type: 'keys',
          data: {
            keys: [
              { type: 'secp256k1', publicKey: '0x1234567890abcdef' },
              { type: 'secp256r1', publicKey: '0xabcdef1234567890' }
            ]
          }
        } as MultiKeySigner
      }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should fail for empty keys array in multi-key signer', () => {
      const request = {
        ...testRequest,
        signer: { type: 'keys', data: { keys: [] } } as any
      }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
    })

    it('should fail for missing data in multi-key signer', () => {
      const request = {
        ...testRequest,
        signer: { type: 'keys' } as any
      }
      expect(() => validateRequest(request)).toThrow('Invalid signer.data: Required')
    })

    it('should fail for missing keys in multi-key signer', () => {
      const request = {
        ...testRequest,
        signer: { type: 'keys', data: {} } as any
      }
      expect(() => validateRequest(request)).toThrow('Invalid signer.data.keys: Required')
    })

    it('should fail for non-object signer', () => {
      const request = {
        ...testRequest,
        signer: 'invalid' as any
      }
      expect(() => validateRequest(request)).toThrow(
        'Invalid signer: Expected object, received string'
      )
    })

    it('should fail for null signer', () => {
      const request = {
        ...testRequest,
        signer: null as any
      }
      expect(() => validateRequest(request)).toThrow(
        'Invalid signer: Expected object, received null'
      )
    })

    it('should fail for signer with invalid key type', () => {
      const request = {
        ...testRequest,
        signer: {
          type: 'keys',
          data: {
            keys: [{ type: 'invalid', publicKey: '0x1234567890abcdef' as Address }]
          }
        } as any
      }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE)
    })

    it('should fail for signer with invalid public key format', () => {
      const request = {
        ...testRequest,
        signer: {
          type: 'keys',
          data: {
            keys: [{ type: 'secp256k1', publicKey: 'invalid' as Hex }]
          }
        } as MultiKeySigner
      }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PUBLIC_KEY_FORMAT)
    })
  })

  describe('Policy field validation', () => {
    it('should pass for valid policies array', () => {
      const request = {
        ...testRequest,
        policies: [
          { type: 'someType', data: { someKey: 'someValue' } },
          { type: 'anotherType', data: { anotherKey: 'anotherValue' } }
        ]
      }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should pass for empty policies array', () => {
      const request = {
        ...testRequest,
        policies: []
      }
      expect(() => validateRequest(request)).not.toThrow()
    })

    it('should fail for non-array policies', () => {
      const request = {
        ...testRequest,
        policies: { type: 'someType', data: {} } as any
      }
      expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_POLICIES_TYPE)
    })

    it('should fail for policies with invalid structure', () => {
      const request = {
        ...testRequest,
        policies: [{ invalidKey: 'value' }] as any
      }
      expect(() => validateRequest(request)).toThrow(
        'Invalid policies.0.type: Required; Invalid policies.0.data: Required'
      )
    })

    it('should fail for policies with missing type', () => {
      const request = {
        ...testRequest,
        policies: [{ data: { key: 'value' } }] as any
      }
      expect(() => validateRequest(request)).toThrow('Invalid policies.0.type: Required')
    })

    it('should fail for policies with missing data', () => {
      const request = {
        ...testRequest,
        policies: [{ type: 'someType' }] as any
      }
      expect(() => validateRequest(request)).toThrow('Invalid policies.0.data: Required')
    })

    it('should fail for policies with non-object data', () => {
      const request = {
        ...testRequest,
        policies: [{ type: 'someType', data: 'invalidData' }] as any
      }
      expect(() => validateRequest(request)).toThrow(
        'Invalid policies.0.data: Expected object, received string'
      )
    })
  })
})
