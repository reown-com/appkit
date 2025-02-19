import { describe, expect, it } from 'vitest'

import type { Tokens } from '@reown/appkit-controllers'

import { ConstantsUtil } from '../src/ConstantsUtil.js'
import { HelpersUtil } from '../src/HelpersUtil.js'

describe('HelpersUtil', () => {
  describe('getCaipTokens', () => {
    it('should return undefined for undefined input', () => {
      const result = HelpersUtil.getCaipTokens(undefined)
      expect(result).toBeUndefined()
    })

    it('should convert tokens to CAIP format', () => {
      const mockTokens: Record<string, { name: string; symbol: string }> = {
        '1': { name: 'Ethereum', symbol: 'ETH' },
        '137': { name: 'Polygon', symbol: 'MATIC' }
      }
      const expected = {
        [`${ConstantsUtil.EIP155}:1`]: { name: 'Ethereum', symbol: 'ETH' },
        [`${ConstantsUtil.EIP155}:137`]: { name: 'Polygon', symbol: 'MATIC' }
      }
      const result = HelpersUtil.getCaipTokens(mockTokens as unknown as Tokens)
      expect(result).toEqual(expected)
    })

    it('should handle empty tokens object', () => {
      const result = HelpersUtil.getCaipTokens({})
      expect(result).toEqual({})
    })
  })
})
