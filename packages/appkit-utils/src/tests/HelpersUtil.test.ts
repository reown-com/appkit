import { describe, it, expect } from 'vitest'
import { HelpersUtil } from '../src/HelpersUtil'
import { ConstantsUtil } from '../src/ConstantsUtil'
import type { Tokens } from '@reown/appkit-core'
import type { CaipNetworkId } from '@reown/appkit-common'

describe('HelpersUtil', () => {
  describe('getCaipTokens', () => {
    it('should return undefined for undefined input', () => {
      const result = HelpersUtil.getCaipTokens(undefined)
      expect(result).toBeUndefined()
    })

    it('should convert tokens to CAIP format', () => {
      const mockTokens: Tokens = {
        '1': { name: 'Ethereum', symbol: 'ETH' },
        '137': { name: 'Polygon', symbol: 'MATIC' }
      }
      const expected: Tokens = {
        [`${ConstantsUtil.EIP155}:1`]: { name: 'Ethereum', symbol: 'ETH' },
        [`${ConstantsUtil.EIP155}:137`]: { name: 'Polygon', symbol: 'MATIC' }
      }
      const result = HelpersUtil.getCaipTokens(mockTokens)
      expect(result).toEqual(expected)
    })

    it('should handle empty tokens object', () => {
      const result = HelpersUtil.getCaipTokens({})
      expect(result).toEqual({})
    })
  })
})
