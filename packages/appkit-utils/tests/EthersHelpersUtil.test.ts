import { describe, it, expect, vi } from 'vitest'
import { EthersHelpersUtil } from '../src/ethers/EthersHelpersUtil.js'
import type { Provider } from '../src/ethers/EthersTypesUtil.js'

describe('EthersHelpersUtil', () => {
  describe('hexStringToNumber', () => {
    it('should convert hex string to number', () => {
      expect(EthersHelpersUtil.hexStringToNumber('0xa')).toBe(10)
      expect(EthersHelpersUtil.hexStringToNumber('ff')).toBe(255)
    })

    it('should handle hex strings with or without 0x prefix', () => {
      expect(EthersHelpersUtil.hexStringToNumber('0x10')).toBe(16)
      expect(EthersHelpersUtil.hexStringToNumber('10')).toBe(16)
    })
  })

  describe('numberToHexString', () => {
    it('should convert number to hex string', () => {
      expect(EthersHelpersUtil.numberToHexString(10)).toBe('0xa')
      expect(EthersHelpersUtil.numberToHexString(255)).toBe('0xff')
    })

    it('should handle string input', () => {
      expect(EthersHelpersUtil.numberToHexString('10')).toBe('0x10')
      expect(EthersHelpersUtil.numberToHexString('255')).toBe('0x255')
    })
  })

  describe('getUserInfo', () => {
    it('should return chainId and addresses', async () => {
      const mockProvider = {
        request: vi.fn().mockResolvedValueOnce(['0x123', '0x456']).mockResolvedValueOnce('0x1')
      } as unknown as Provider

      const result = await EthersHelpersUtil.getUserInfo(mockProvider)
      expect(result).toEqual({ chainId: 1, addresses: ['0x123', '0x456'] })
    })
  })

  describe('getChainId', () => {
    it('should return the chain ID as a number', async () => {
      const mockProvider = {
        request: vi.fn().mockResolvedValue('0xa')
      } as unknown as Provider

      const result = await EthersHelpersUtil.getChainId(mockProvider)
      expect(result).toBe(10)
    })
  })

  describe('getAddress', () => {
    it('should return the first address', async () => {
      const mockProvider = {
        request: vi.fn().mockResolvedValue(['0x123', '0x456'])
      } as unknown as Provider

      const result = await EthersHelpersUtil.getAddress(mockProvider)
      expect(result).toBe('0x123')
    })
  })

  describe('getAddresses', () => {
    it('should return all addresses', async () => {
      const mockProvider = {
        request: vi.fn().mockResolvedValue(['0x123', '0x456'])
      } as unknown as Provider

      const result = await EthersHelpersUtil.getAddresses(mockProvider)
      expect(result).toEqual(['0x123', '0x456'])
    })
  })
})
