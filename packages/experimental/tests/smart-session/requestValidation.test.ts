import { describe, expect, it, beforeEach } from 'vitest'
import type {
  ContractCallPermission,
  MultiKeySigner,
  SmartSessionGrantPermissionsRequest
} from '../../src/smart-session/utils/TypeUtils.js'
import { donutContractAbi } from '../data/abi.js'
import { validateRequest } from '../../src/smart-session/helper/index.js'
import { ERROR_MESSAGES } from '../../src/smart-session/schema/index.js'

describe('smart-session/schema', () => {
  let mockRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    mockRequest = {
      chainId: '0x1',
      expiry: Date.now() + 10000,
      signer: {
        type: 'keys',
        data: {
          keys: [{ type: 'secp256k1', publicKey: '0x123456' }]
        }
      },
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
  })

  describe('validateRequest', () => {
    describe('request object validation', () => {
      it('should pass for valid request', () => {
        expect(() => validateRequest(mockRequest)).not.toThrow()
      })
      it('should fail for missing chainId', () => {
        const { chainId, ...requestWithoutChainId } = mockRequest
        expect(() => validateRequest(requestWithoutChainId as any)).toThrow(
          'Invalid chainId: Required'
        )
      })
    })
    describe('ChainIdSchema Validation', () => {
      it('should pass for valid chainId', () => {
        const request = { ...mockRequest, chainId: '0x1' as `0x${string}` }
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
        const request = { ...mockRequest, chainId }
        if (chainId === undefined) {
          const { chainId, ...requestWithoutChainId } = request
          expect(() => validateRequest(requestWithoutChainId as any)).toThrow(/Invalid chainId/)
        } else {
          expect(() => validateRequest(request as any)).toThrow(/Invalid chainId/)
        }
      })

      it('should handle chainIds with leading zeros', () => {
        const request = { ...mockRequest, chainId: '0x01' as `0x${string}` }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should be case insensitive for hex characters', () => {
        const request1 = { ...mockRequest, chainId: '0xaB1' as `0x${string}` }
        const request2 = { ...mockRequest, chainId: '0xAb1' as `0x${string}` }
        expect(() => validateRequest(request1)).not.toThrow()
        expect(() => validateRequest(request2)).not.toThrow()
      })
    })
    describe('Address field validation', () => {
      it('should pass for valid Ethereum address', () => {
        const request = {
          ...mockRequest,
          address: '0x1234567890123456789012345678901234567890' as `0x${string}`
        }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should pass when address is omitted', () => {
        const { address, ...requestWithoutAddress } = mockRequest
        expect(() => validateRequest(requestWithoutAddress)).not.toThrow()
      })

      it('should fail for address not starting with 0x', () => {
        const request = {
          ...mockRequest,
          address: '1234567890123456789012345678901234567890' as `0x${string}`
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
      })

      it('should fail for empty string address', () => {
        const request = { ...mockRequest, address: '' as any }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
      })

      it('should fail for non-string address', () => {
        const request = { ...mockRequest, address: 123 as any }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
      })

      it('should fail for null address', () => {
        const request = { ...mockRequest, address: null as any }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
      })

      it('should fail for undefined address', () => {
        const request = { ...mockRequest, address: undefined }
        expect(() => validateRequest(request)).not.toThrow() // Because it's optional
      })

      it('should be case insensitive for hex characters', () => {
        const request = { ...mockRequest, address: ('0xAbCd' + '0'.repeat(36)) as `0x${string}` }
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
        const request = { ...mockRequest, expiry: currentTimestamp + 3600 } // 1 hour in the future
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should fail for a negative expiry', () => {
        const request = { ...mockRequest, expiry: -1 }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
      })

      it('should fail for a zero expiry', () => {
        const request = { ...mockRequest, expiry: 0 }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
      })

      it('should fail for a past expiry', () => {
        const request = { ...mockRequest, expiry: currentTimestamp - 3600 } // 1 hour in the past
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
      })

      it('should fail for a current timestamp expiry', () => {
        const request = { ...mockRequest, expiry: currentTimestamp }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_EXPIRY)
      })

      it('should fail for a non-number expiry', () => {
        const request = { ...mockRequest, expiry: '1234567890' as any }
        expect(() => validateRequest(request)).toThrow(
          'Invalid expiry: Expected number, received string'
        )
      })

      it('should fail for an undefined expiry', () => {
        const { expiry, ...requestWithoutExpiry } = mockRequest
        expect(() => validateRequest(requestWithoutExpiry as any)).toThrow(
          'Invalid expiry: Required'
        )
      })

      it('should fail for a null expiry', () => {
        const request = { ...mockRequest, expiry: null as any }
        expect(() => validateRequest(request)).toThrow(
          'Invalid expiry: Expected number, received null'
        )
      })

      it('should pass for an expiry 1 hour in the future', () => {
        const request = { ...mockRequest, expiry: currentTimestamp + 3600 }
        expect(() => validateRequest(request)).not.toThrow()
      })
    })

    describe('Signer field validation', () => {
      it('should fail for unsupported signer', () => {
        const request = {
          ...mockRequest,
          signer: {
            type: 'key',
            data: { type: 'secp256k1', publicKey: '0x1234567890abcdef' as `0x${string}` }
          } as any
        }
        expect(() => validateRequest(request)).toThrow()
      })

      it('should pass for valid multi-key signer', () => {
        const request = {
          ...mockRequest,
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
          ...mockRequest,
          signer: { type: 'keys', data: { keys: [] } } as any
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
      })

      it('should fail for missing data in multi-key signer', () => {
        const request = {
          ...mockRequest,
          signer: { type: 'keys' } as any
        }
        expect(() => validateRequest(request)).toThrow('Invalid signer.data: Required')
      })

      it('should fail for missing keys in multi-key signer', () => {
        const request = {
          ...mockRequest,
          signer: { type: 'keys', data: {} } as any
        }
        expect(() => validateRequest(request)).toThrow('Invalid signer.data.keys: Required')
      })

      it('should fail for non-object signer', () => {
        const request = {
          ...mockRequest,
          signer: 'invalid' as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid signer: Expected object, received string'
        )
      })

      it('should fail for null signer', () => {
        const request = {
          ...mockRequest,
          signer: null as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid signer: Expected object, received null'
        )
      })

      it('should fail for signer with invalid key type', () => {
        const request = {
          ...mockRequest,
          signer: {
            type: 'keys',
            data: {
              keys: [{ type: 'invalid', publicKey: '0x1234567890abcdef' as `0x${string}` }]
            }
          } as any
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE)
      })

      it('should fail for signer with invalid public key format', () => {
        const request = {
          ...mockRequest,
          signer: {
            type: 'keys',
            data: {
              keys: [{ type: 'secp256k1', publicKey: 'invalid' as `0x${string}` }]
            }
          } as MultiKeySigner
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PUBLIC_KEY_FORMAT)
      })
    })

    describe('Permissions field validation', () => {
      const validPermission = {
        type: 'contract-call',
        data: {
          address: '0x1234567890123456789012345678901234567890',
          abi: [{}],
          functions: [{ functionName: 'testFunction' }]
        }
      } as ContractCallPermission

      it('should pass for valid permissions array', () => {
        const request = {
          ...mockRequest,
          permissions: [validPermission]
        }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should pass for multiple valid permissions', () => {
        const request = {
          ...mockRequest,
          permissions: [validPermission, validPermission]
        }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should fail for empty permissions array', () => {
        const request = {
          ...mockRequest,
          permissions: []
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS)
      })

      it('should fail for non-array permissions', () => {
        const request = {
          ...mockRequest,
          permissions: validPermission as any
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS_TYPE)
      })

      it('should fail for invalid permission type', () => {
        const request = {
          ...mockRequest,
          permissions: [{ ...validPermission, type: 'invalid-type' }] as any
        }
        expect(() => validateRequest(request)).toThrow(
          `Invalid permissions.0.type: ${ERROR_MESSAGES.INVALID_PERMISSIONS_TYPE_LITERALS}`
        )
      })

      it('should fail for missing address in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, address: undefined }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission] as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid permissions.0.data.address: Required'
        )
      })

      it('should fail for invalid address format in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, address: '1234' }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission] as any
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
      })

      it('should fail for missing abi in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, abi: undefined }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission] as any
        }
        expect(() => validateRequest(request)).toThrow('Invalid permissions.0.data.abi: Required')
      })

      it('should fail for non-array abi in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, abi: {} as any }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission]
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid permissions.0.data.abi: Expected array, received object'
        )
      })

      it('should fail for missing functions in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, functions: undefined }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission] as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid permissions.0.data.functions: Required'
        )
      })

      it('should fail for non-array functions in permission data', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, functions: {} as any }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission]
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid permissions.0.data.functions: Expected array, received object'
        )
      })

      it('should fail for missing functionName in function permission', () => {
        const invalidPermission = {
          ...validPermission,
          data: { ...validPermission.data, functions: [{}] }
        }
        const request = {
          ...mockRequest,
          permissions: [invalidPermission] as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid permissions.0.data.functions.0.functionName: Required'
        )
      })
    })

    describe('Policy field validation', () => {
      it('should pass for valid policies array', () => {
        const request = {
          ...mockRequest,
          policies: [
            { type: 'someType', data: { someKey: 'someValue' } },
            { type: 'anotherType', data: { anotherKey: 'anotherValue' } }
          ]
        }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should pass for empty policies array', () => {
        const request = {
          ...mockRequest,
          policies: []
        }
        expect(() => validateRequest(request)).not.toThrow()
      })

      it('should fail for non-array policies', () => {
        const request = {
          ...mockRequest,
          policies: { type: 'someType', data: {} } as any
        }
        expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_POLICIES_TYPE)
      })

      it('should fail for policies with invalid structure', () => {
        const request = {
          ...mockRequest,
          policies: [{ invalidKey: 'value' }] as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid policies.0.type: Required; Invalid policies.0.data: Required'
        )
      })

      it('should fail for policies with missing type', () => {
        const request = {
          ...mockRequest,
          policies: [{ data: { key: 'value' } }] as any
        }
        expect(() => validateRequest(request)).toThrow('Invalid policies.0.type: Required')
      })

      it('should fail for policies with missing data', () => {
        const request = {
          ...mockRequest,
          policies: [{ type: 'someType' }] as any
        }
        expect(() => validateRequest(request)).toThrow('Invalid policies.0.data: Required')
      })

      it('should fail for policies with non-object data', () => {
        const request = {
          ...mockRequest,
          policies: [{ type: 'someType', data: 'invalidData' }] as any
        }
        expect(() => validateRequest(request)).toThrow(
          'Invalid policies.0.data: Expected object, received string'
        )
      })
    })
  })
})
