import { describe, test, expect } from 'vitest'
import { NetworkUtil } from '../src/utils/NetworkUtil'

describe('NetworkUtil', () => {
  describe('caipNetworkIdToNumber', () => {
    test('converts valid CAIP network ID to number', () => {
      expect(NetworkUtil.caipNetworkIdToNumber('eip155:1')).toBe(1)
      expect(NetworkUtil.caipNetworkIdToNumber('eip155:42')).toBe(42)
    })

    test('returns undefined for undefined input', () => {
      expect(NetworkUtil.caipNetworkIdToNumber(undefined)).toBeUndefined()
    })

    test('returns NaN for invalid CAIP network ID', () => {
      expect(NetworkUtil.caipNetworkIdToNumber('invalid:id' as any)).toBeNaN()
    })
  })

  describe('parseEvmChainId', () => {
    test('parses string CAIP network ID', () => {
      expect(NetworkUtil.parseEvmChainId('eip155:1')).toBe(1)
      expect(NetworkUtil.parseEvmChainId('eip155:42')).toBe(42)
    })

    test('returns number input as-is', () => {
      expect(NetworkUtil.parseEvmChainId(1)).toBe(1)
      expect(NetworkUtil.parseEvmChainId(42)).toBe(42)
    })

    test('returns NaN for invalid string input', () => {
      expect(NetworkUtil.parseEvmChainId('invalid')).toBeNaN()
    })
  })
})
