import { describe, expect, it } from 'vitest'

import { EnsUtil } from '../../src/utils/EnsUtil'

describe('EnsUtil', () => {
  describe('convertEVMChainIdToCoinType', () => {
    it('should correctly convert valid EVM chain IDs to coin types', () => {
      expect(EnsUtil.convertEVMChainIdToCoinType(1)).toBe(0x80000001)
      expect(EnsUtil.convertEVMChainIdToCoinType(5)).toBe(0x80000005)
      expect(EnsUtil.convertEVMChainIdToCoinType(137)).toBe(0x80000089)
    })

    it('should handle the maximum valid chain ID', () => {
      const maxValidChainId = 0x7fffffff // 2147483647
      expect(EnsUtil.convertEVMChainIdToCoinType(maxValidChainId)).toBe(0xffffffff)
    })

    it('should throw an error for chain IDs that are too large', () => {
      const tooLargeChainId = 0x80000000 // 2147483648
      expect(() => EnsUtil.convertEVMChainIdToCoinType(tooLargeChainId)).toThrow('Invalid chainId')
    })

    it('should handle chain ID 0', () => {
      expect(EnsUtil.convertEVMChainIdToCoinType(0)).toBe(0x80000000)
    })
  })
})
