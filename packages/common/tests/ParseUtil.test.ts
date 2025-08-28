import { describe, expect, test } from 'vitest'

import { ParseUtil } from '../src/utils/ParseUtil'
import type { CaipAddress, CaipAsset, CaipNetworkId } from '../src/utils/TypeUtil'

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

  describe('parseCaipAsset', () => {
    test('parses valid ERC20 asset without token ID', () => {
      const assetId: CaipAsset = 'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'
      const result = ParseUtil.parseCaipAsset(assetId)
      expect(result).toEqual({
        caipNetwork: 'eip155:1',
        asset: {
          namespace: 'erc20',
          address: '0x6b175474e89094c44da98b954eedeac495271d0f'
        },
        tokenId: undefined
      })
    })

    test('parses valid ERC721 asset with token ID', () => {
      const assetId: CaipAsset = 'eip155:1/erc721:0x06012c8cf97BEaD5deAe237070F9587f8E7A266d/771769'
      const result = ParseUtil.parseCaipAsset(assetId)
      expect(result).toEqual({
        caipNetwork: 'eip155:1',
        asset: {
          namespace: 'erc721',
          address: '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'
        },
        tokenId: '771769'
      })
    })

    test('parses valid ERC1155 asset with token ID', () => {
      const assetId: CaipAsset = 'eip155:1/erc1155:0x1234567890123456789012345678901234567890/12345'
      const result = ParseUtil.parseCaipAsset(assetId)
      expect(result).toEqual({
        caipNetwork: 'eip155:1',
        asset: {
          namespace: 'erc1155',
          address: '0x1234567890123456789012345678901234567890'
        },
        tokenId: '12345'
      })
    })

    test('parses Solana asset', () => {
      const assetId: CaipAsset = 'solana:mainnet/spl:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      const result = ParseUtil.parseCaipAsset(assetId)
      expect(result).toEqual({
        caipNetwork: 'solana:mainnet',
        asset: {
          namespace: 'spl',
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        },
        tokenId: undefined
      })
    })

    test('throws error for invalid asset ID with missing parts', () => {
      const invalidAssetId = 'eip155:1'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset id'
      )
    })

    test('throws error for invalid asset ID with empty caipNetwork', () => {
      const invalidAssetId = '/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset id'
      )
    })

    test('throws error for invalid asset ID with empty asset name', () => {
      const invalidAssetId = 'eip155:1/'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset id'
      )
    })

    test('throws error for invalid asset name without colon', () => {
      const invalidAssetId = 'eip155:1/erc200x6b175474e89094c44da98b954eedeac495271d0f'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset name'
      )
    })

    test('throws error for invalid asset name with empty namespace', () => {
      const invalidAssetId = 'eip155:1/:0x6b175474e89094c44da98b954eedeac495271d0f'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset name'
      )
    })

    test('throws error for invalid asset name with empty address', () => {
      const invalidAssetId = 'eip155:1/erc20:'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset name'
      )
    })

    test('throws error for asset ID with too many parts', () => {
      const invalidAssetId = 'eip155:1/erc20:0x123/456/789'
      expect(() => ParseUtil.parseCaipAsset(invalidAssetId as CaipAsset)).toThrow(
        'Invalid CAIP-19 asset id'
      )
    })
  })
})
