import { describe, expect, it } from 'vitest'

import { TokenUtil } from '../src/TokenUtil.js'

describe('TokenUtil', () => {
  describe('getTokenSymbolByAddress', () => {
    it('should return undefined for undefined input', () => {
      const result = TokenUtil.getTokenSymbolByAddress(undefined)
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string input', () => {
      const result = TokenUtil.getTokenSymbolByAddress('')
      expect(result).toBeUndefined()
    })

    it('should return symbol for valid USDC address on Base mainnet', () => {
      const result = TokenUtil.getTokenSymbolByAddress('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913')
      expect(result).toBe('USDC')
    })

    it('should return symbol for valid USDC address on Base testnet', () => {
      const result = TokenUtil.getTokenSymbolByAddress('0x036CbD53842c5426634e7929541eC2318f3dCF7e')
      expect(result).toBe('USDC')
    })

    it('should return undefined for unknown token address', () => {
      const result = TokenUtil.getTokenSymbolByAddress('0x1234567890123456789012345678901234567890')
      expect(result).toBeUndefined()
    })
  })
})
