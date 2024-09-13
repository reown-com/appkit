import { describe, test, expect } from 'vitest'
import { ParseUtil } from '../src/utils/ParseUtil'
import type { CaipAddress, CaipNetworkId } from '../src/utils/TypeUtil'

describe('ParseUtil', () => {
  describe('parseCaipAddress', () => {
    test('parses valid CAIP-10 address', () => {
      const caipAddress: CaipAddress = 'eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      const result = ParseUtil.parseCaipAddress(caipAddress)
      expect(result).toEqual({
        chainNamespace: 'eip155',
        chainId: '1',
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      })
    })

    test('throws error for invalid CAIP-10 address with missing parts', () => {
      const invalidAddress = 'eip155:1'
      expect(() => ParseUtil.parseCaipAddress(invalidAddress as CaipAddress)).toThrow(
        'Invalid CAIP-10 address'
      )
    })

    test('throws error for invalid CAIP-10 address with empty parts', () => {
      const invalidAddress = 'eip155::0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      expect(() => ParseUtil.parseCaipAddress(invalidAddress as CaipAddress)).toThrow(
        'Invalid CAIP-10 address'
      )
    })

    test('throws error for invalid CAIP-10 address with too many parts', () => {
      const invalidAddress = 'eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e:extra'
      expect(() => ParseUtil.parseCaipAddress(invalidAddress as CaipAddress)).toThrow(
        'Invalid CAIP-10 address'
      )
    })
  })

  describe('parseCaipNetworkId', () => {
    test('parses valid CAIP-2 network id', () => {
      const caipNetworkId: CaipNetworkId = 'eip155:1'
      const result = ParseUtil.parseCaipNetworkId(caipNetworkId)
      expect(result).toEqual({
        chainNamespace: 'eip155',
        chainId: '1'
      })
    })

    test('throws error for invalid CAIP-2 network id with missing parts', () => {
      const invalidNetworkId = 'eip155'
      expect(() => ParseUtil.parseCaipNetworkId(invalidNetworkId as CaipNetworkId)).toThrow(
        'Invalid CAIP-2 network id'
      )
    })

    test('throws error for invalid CAIP-2 network id with empty parts', () => {
      const invalidNetworkId = 'eip155:'
      expect(() => ParseUtil.parseCaipNetworkId(invalidNetworkId as CaipNetworkId)).toThrow(
        'Invalid CAIP-2 network id'
      )
    })

    test('throws error for invalid CAIP-2 network id with too many parts', () => {
      const invalidNetworkId = 'eip155:1:extra'
      expect(() => ParseUtil.parseCaipNetworkId(invalidNetworkId as CaipNetworkId)).toThrow(
        'Invalid CAIP-2 network id'
      )
    })
  })
})
