import { afterEach, describe, expect, it, vi } from 'vitest'

import { type Address, type Hex } from '@reown/appkit-common'

import { ERC7811Utils, type WalletGetAssetsResponse } from '../../src/utils/ERC7811Util'

describe('ERC7811Util', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createBalance', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should create a Balance object from an Asset object', () => {
      const asset = {
        address: '0x1234567890123456789012345678901234567890' as Address,
        balance: '0x1000' as Hex,
        type: 'ERC20' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'Test Token',
          symbol: 'TST',
          decimals: 18,
          value: 10,
          price: 1,
          iconUrl: 'https://example.com/icon.png'
        }
      }
      const chainId = 'eip155:1'

      const balance = ERC7811Utils.createBalance(asset, chainId)

      expect(balance).toEqual({
        name: 'Test Token',
        symbol: 'TST',
        chainId: 'eip155:1',
        address: 'eip155:1:0x1234567890123456789012345678901234567890',
        value: 10,
        price: 1,
        quantity: {
          decimals: '18',
          numeric: '0.000000000000004096' // 0x1000 in decimal with 18 decimals
        },
        iconUrl: 'https://example.com/icon.png'
      })
    })

    it('should create a Balance object from a valid native asset object', () => {
      const asset = {
        address: 'native' as 'native',
        balance: '0xDE0B6B3A7640000' as Hex,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          value: 0.0001,
          price: 3200,
          iconUrl: 'https://example.com/icon.png'
        }
      }

      const chainId = 'eip155:1'
      const balance = ERC7811Utils.createBalance(asset, chainId)

      expect(balance).toMatchObject({
        name: 'Ethereum',
        symbol: 'ETH',
        chainId,
        address: undefined, // Address should be undefined for native token
        value: 0.0001,
        price: 3200,
        quantity: {
          decimals: '18',
          numeric: expect.any(String) // Check that numeric is a string
        },
        iconUrl: 'https://example.com/icon.png'
      })
    })

    it('should create a Balance object with complete metadata', () => {
      const asset = {
        address: 'native' as 'native',
        balance: '0xDE0B6B3A7640000' as Hex,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          value: 0.0001,
          price: 3200,
          iconUrl: 'https://example.com/icon.png'
        }
      }

      const chainId = 'eip155:1'
      const balance = ERC7811Utils.createBalance(asset as any, chainId)

      expect(balance).toMatchObject({
        name: 'Ethereum',
        symbol: 'ETH',
        chainId,
        address: undefined, // Address should be undefined for native token
        value: 0.0001,
        price: 3200,
        quantity: {
          decimals: '18',
          numeric: expect.any(String) // Check that numeric is a string
        },
        iconUrl: 'https://example.com/icon.png'
      })
    })

    it('should create a Balance object with default values for missing metadata', () => {
      const asset = {
        address: 'native' as 'native',
        balance: '0xDE0B6B3A7640000' as Hex,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          // Missing fields
          // name, symbol, decimals, value, price, and iconUrl are missing
        }
      }

      const chainId = 'eip155:1'
      const balance = ERC7811Utils.createBalance(asset as any, chainId)

      expect(balance).toMatchObject({
        name: '', // Default value
        symbol: '', // Default value
        chainId,
        address: undefined, // Address should be undefined for native token
        value: 0, // Default value
        price: 0, // Default value
        quantity: {
          decimals: '0', // Default value for decimals
          numeric: expect.any(String) // Check that numeric is a string
        },
        iconUrl: '' // Default value for iconUrl
      })
    })
  })

  describe('convertHexToBalance', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should convert a hex string to a Balance object', () => {
      const hex = '0x1000' as Hex
      const decimals = 18

      const balance = ERC7811Utils.convertHexToBalance({ hex, decimals })

      expect(balance).toBe('0.000000000000004096')
    })
  })

  describe('convertAddressToCAIP10Address', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should convert an address to a CAIP-10 address', () => {
      const address = '0x123' as Address
      const chainId = 'eip155:1'

      const caip10Address = ERC7811Utils.convertAddressToCAIP10Address(address, chainId)

      expect(caip10Address).toBe('eip155:1:0x123')
    })
  })

  describe('createCAIP2ChainId', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should create a CAIP-2 Chain ID from a chain ID and namespace', () => {
      const chainId = '0x1' as Hex
      const namespace = 'eip155'

      const caip2ChainId = ERC7811Utils.createCAIP2ChainId(chainId, namespace)

      expect(caip2ChainId).toBe('eip155:1')
    })
  })

  describe('getChainIdHexFromCAIP2ChainId', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should get the chain ID in hex format from a CAIP-2 Chain ID', () => {
      const caip2ChainId = 'eip155:1'

      const chainIdHex = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caip2ChainId)

      expect(chainIdHex).toBe('0x1')
    })

    it('should handle cases where chain part is missing', () => {
      const caip2ChainId = 'eip155:'

      const chainIdHex = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caip2ChainId)

      expect(chainIdHex).toBe('0x0')
    })

    it('should return "0x0" for invalid CAIP-2 Chain ID', () => {
      const caip2ChainId = 'invalid:chain'
      const result = ERC7811Utils.getChainIdHexFromCAIP2ChainId(caip2ChainId as any)

      expect(result).toBe('0x0')
    })
  })

  describe('isWalletGetAssetsResponse', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return true for a valid WalletGetAssetsResponse', () => {
      const validResponse: WalletGetAssetsResponse = {
        '0x123': [
          {
            address: '0x123' as Address,
            balance: '0x1000' as Hex,
            type: 'ERC20' as 'ERC20' | 'NATIVE',
            metadata: {
              name: 'Test Token',
              symbol: 'TST',
              decimals: 18,
              value: 10,
              price: 1,
              iconUrl: 'https://example.com/icon.png'
            }
          }
        ],
        '0x456': []
      }

      expect(ERC7811Utils.isWalletGetAssetsResponse(validResponse)).toBe(true)
    })

    it('should return true for an valid WalletGetAssetsResponse = {}', () => {
      const validResponse = {}

      expect(ERC7811Utils.isWalletGetAssetsResponse(validResponse as any)).toBe(true)
    })

    it('should return false for an invalid WalletGetAssetsResponse', () => {
      const invalidResponse = {
        '0x1': 'not an array'
      }

      expect(ERC7811Utils.isWalletGetAssetsResponse(invalidResponse as any)).toBe(false)
    })

    it('should return false for an invalid WalletGetAssetsResponse (not an object)', () => {
      const invalidResponse = 'not an object'

      expect(ERC7811Utils.isWalletGetAssetsResponse(invalidResponse as any)).toBe(false)
    })

    it('should return false for an invalid WalletGetAssetsResponse (null)', () => {
      const invalidResponse = null

      expect(ERC7811Utils.isWalletGetAssetsResponse(invalidResponse as any)).toBe(false)
    })

    it('should return false for an invalid WalletGetAssetsResponse (mixed values)', () => {
      const invalidResponse = {
        '0x123': ['asset1'],
        '0x456': 'not an array'
      }

      expect(ERC7811Utils.isWalletGetAssetsResponse(invalidResponse as any)).toBe(false)
    })
  })

  describe('isValidAsset', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return true for a valid asset', () => {
      const validAsset = {
        address: '0x1234567890123456789012345678901234567890' as Address,
        balance: '0x1000' as Hex,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          price: 3200,
          iconUrl: 'https://example.com/icon.png'
        }
      }

      expect(ERC7811Utils.isValidAsset(validAsset)).toBe(true)
    })

    it('should return false for an invalid asset', () => {
      const invalidAsset = {
        address: '0x1234567890123456789012345678901234567890' as Address,
        balance: '0x1000' as Hex,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 'not a number', // Invalid type
          price: 3200,
          iconUrl: 'https://example.com/icon.png'
        }
      }

      expect(ERC7811Utils.isValidAsset(invalidAsset)).toBe(false)
    })
  })
})
