import { describe, expect, it } from 'vitest'

import { ConverterUtil } from '../../src/erc3770/utils/ConverterUtil'

describe('ConverterUtil', () => {
  describe('convertCaip10ToErc3770', () => {
    it('should convert Ethereum mainnet CAIP address to ERC-3770 format', () => {
      const caipAddress = 'eip155:1:0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.convertCaip10ToErc3770(caipAddress)
      expect(result).toBe('eth:0x123456789abcdef123456789abcdef123456789a')
    })

    it('should convert Polygon mainnet CAIP address to ERC-3770 format', () => {
      const caipAddress = 'eip155:137:0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.convertCaip10ToErc3770(caipAddress)
      expect(result).toBe('pol:0x123456789abcdef123456789abcdef123456789a')
    })

    it('should throw error for invalid CAIP format', () => {
      const invalidAddress = 'invalid:format'
      expect(() => ConverterUtil.convertCaip10ToErc3770(invalidAddress)).toThrow(
        'Invalid CAIP address format'
      )
    })

    it('should throw error for non-EIP155 namespace', () => {
      const nonEip155Address = 'solana:1:0x123456789abcdef123456789abcdef123456789a'
      expect(() => ConverterUtil.convertCaip10ToErc3770(nonEip155Address)).toThrow(
        'Only EIP-155 namespace is supported'
      )
    })

    it('should throw error for unknown chain ID', () => {
      const unknownChainAddress = 'eip155:0:0x123456789abcdef123456789abcdef123456789a'
      expect(() => ConverterUtil.convertCaip10ToErc3770(unknownChainAddress)).toThrow(
        'Chain ID 0 not found in shortname list'
      )
    })

    it('should handle case-insensitive namespace', () => {
      const mixedCaseAddress = 'EIP155:1:0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.convertCaip10ToErc3770(mixedCaseAddress)
      expect(result).toBe('eth:0x123456789abcdef123456789abcdef123456789a')
    })
  })

  describe('createErc3770Address', () => {
    it('should create ERC-3770 address for Ethereum mainnet', () => {
      const address = '0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.createErc3770Address(address, '1')
      expect(result).toBe('eth:0x123456789abcdef123456789abcdef123456789a')
    })

    it('should create ERC-3770 address for Polygon mainnet', () => {
      const address = '0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.createErc3770Address(address, '137')
      expect(result).toBe('pol:0x123456789abcdef123456789abcdef123456789a')
    })

    it('should throw error for unknown chain ID', () => {
      const address = '0x123456789abcdef123456789abcdef123456789a'
      expect(() => ConverterUtil.createErc3770Address(address, '0')).toThrow(
        'Chain ID 0 not found in shortname list'
      )
    })

    it('should throw error for invalid ethereum address', () => {
      const invalidAddress = '0xinvalid'
      expect(() => ConverterUtil.createErc3770Address(invalidAddress, '1')).toThrow(
        'Invalid ERC-55 address format'
      )
    })

    it('should normalize the ethereum address to checksum format', () => {
      const lowercase = '0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.createErc3770Address(lowercase, '1')
      expect(result).toBe('eth:0x123456789aBcDEf123456789aBcDEf123456789A')
    })

    it('should handle hex chain IDs', () => {
      const address = '0x123456789abcdef123456789abcdef123456789a'
      const result = ConverterUtil.createErc3770Address(address, '0x89')
      expect(result).toBe('pol:0x123456789abcdef123456789abcdef123456789a')
    })
  })
})
