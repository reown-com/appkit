import { describe, expect, it } from 'vitest'

import { ERC7811Utils } from '../../src/utils/ERC7811Util'

describe('ERC7811Util', () => {
  describe('createBalance', () => {
    it('should create a Balance object from an Asset object', () => {
      const asset = {
        address: '0x123' as `0x${string}`,
        balance: '0x1000' as `0x${string}`,
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
        address: 'eip155:1:0x123',
        value: 10,
        price: 1,
        quantity: {
          decimals: '18',
          numeric: '0.000000000000004096' // 0x1000 in decimal with 18 decimals
        },
        iconUrl: 'https://example.com/icon.png'
      })
    })

    it('should create a Balance object for native token', () => {
      const asset = {
        address: 'native' as `0x${string}` | 'native',
        balance: '0x1000' as `0x${string}`,
        type: 'NATIVE' as 'ERC20' | 'NATIVE',
        metadata: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
          value: 10,
          price: 1,
          iconUrl: 'https://example.com/icon.png'
        }
      }
      const chainId = 'eip155:1'

      const balance = ERC7811Utils.createBalance(asset, chainId)

      expect(balance).toEqual({
        name: 'ETH',
        symbol: 'ETH',
        chainId: 'eip155:1',
        address: undefined, // Address should be undefined for native token
        value: 10,
        price: 1,
        quantity: {
          decimals: '18',
          numeric: '0.000000000000004096' // 0x1000 in decimal with 18 decimals
        },
        iconUrl: 'https://example.com/icon.png'
      })
    })
  })

  describe('convertHexToBalance', () => {
    it('should convert a hex string to a Balance object', () => {
      const hex = '0x1000' as `0x${string}`
      const decimals = 18

      const balance = ERC7811Utils.convertHexToBalance({ hex, decimals })

      expect(balance).toBe('0.000000000000004096')
    })
  })

  describe('convertAddressToCAIP10Address', () => {
    it('should convert an address to a CAIP-10 address', () => {
      const address = '0x123' as `0x${string}`
      const chainId = 'eip155:1'

      const caip10Address = ERC7811Utils.convertAddressToCAIP10Address(address, chainId)

      expect(caip10Address).toBe('eip155:1:0x123')
    })
  })

  describe('createCAIP2ChainId', () => {
    it('should create a CAIP-2 Chain ID from a chain ID and namespace', () => {
      const chainId = '0x1' as `0x${string}`
      const namespace = 'eip155'

      const caip2ChainId = ERC7811Utils.createCAIP2ChainId(chainId, namespace)

      expect(caip2ChainId).toBe('eip155:1')
    })
  })

  describe('getChainIdHexFromCAIP2ChainId', () => {
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
  })
})
