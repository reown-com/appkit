import { describe, expect, it } from 'vitest'

import type { CaipNetworkId } from '@reown/appkit-common'

import { formatCaip19Asset } from '../../src/utils/AssetUtil.js'

describe('AssetUtil', () => {
  describe('formatCaip19Asset', () => {
    it('should format native asset correctly for eip155', () => {
      const caipNetworkId: CaipNetworkId = 'eip155:1'
      const asset = 'native'
      const expectedCaip19 = 'eip155:1/slip44:60'
      expect(formatCaip19Asset(caipNetworkId, asset)).toBe(expectedCaip19)
    })

    it('should format ERC20 token asset correctly for eip155 (Base)', () => {
      const caipNetworkId: CaipNetworkId = 'eip155:8453'
      const asset = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
      const expectedCaip19 = 'eip155:8453/erc20:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
      expect(formatCaip19Asset(caipNetworkId, asset)).toBe(expectedCaip19)
    })

    it('should format another ERC20 token asset correctly for eip155 (Ethereum)', () => {
      const caipNetworkId: CaipNetworkId = 'eip155:1'
      const asset = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      const expectedCaip19 = 'eip155:1/erc20:0xdAC17F958D2ee523a2206206994597C13D831ec7'
      expect(formatCaip19Asset(caipNetworkId, asset)).toBe(expectedCaip19)
    })

    it('should handle different chain IDs correctly (Arbitrum)', () => {
      const caipNetworkId: CaipNetworkId = 'eip155:42161'
      const asset = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
      const expectedCaip19 = 'eip155:42161/erc20:0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
      expect(formatCaip19Asset(caipNetworkId, asset)).toBe(expectedCaip19)
    })

    it('should throw an error for unsupported chain namespace', () => {
      const caipNetworkId = 'solana:101' as CaipNetworkId
      const asset = 'native'
      expect(() => formatCaip19Asset(caipNetworkId, asset)).toThrow(
        'Unsupported chain namespace for CAIP-19 formatting: solana'
      )
    })
  })
})
