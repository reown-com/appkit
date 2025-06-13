import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Tokens } from '@reown/appkit-controllers'
import { ChainController, ConnectorController } from '@reown/appkit-controllers'

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

  describe('isLowerCaseMatch', () => {
    it('should return true for matching strings regardless of case', () => {
      expect(HelpersUtil.isLowerCaseMatch('Hello', 'hello')).toBe(true)
      expect(HelpersUtil.isLowerCaseMatch('WORLD', 'world')).toBe(true)
      expect(HelpersUtil.isLowerCaseMatch('Test123', 'test123')).toBe(true)
    })

    it('should return false for non-matching strings', () => {
      expect(HelpersUtil.isLowerCaseMatch('Hello', 'World')).toBe(false)
      expect(HelpersUtil.isLowerCaseMatch('Test', 'Test123')).toBe(false)
    })

    it('should handle undefined inputs', () => {
      expect(HelpersUtil.isLowerCaseMatch(undefined, 'test')).toBe(false)
      expect(HelpersUtil.isLowerCaseMatch('test', undefined)).toBe(false)
      expect(HelpersUtil.isLowerCaseMatch(undefined, undefined)).toBe(true)
    })
  })

  describe('getActiveNamespaceConnectedToAuth', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return the active chain when it matches auth connector', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'solana'
      } as any)
      vi.spyOn(ConnectorController, 'getConnectorId').mockImplementation(chain => {
        if (chain === 'eip155' || chain === 'solana') {
          return CommonConstantsUtil.CONNECTOR_ID.AUTH
        }
        return undefined
      })
      const result = HelpersUtil.getActiveNamespaceConnectedToAuth()
      expect(result).toBe('solana')
    })

    it('should return undefined when active chain does not match auth connector', () => {
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('other-connector')
      const result = HelpersUtil.getActiveNamespaceConnectedToAuth()
      expect(result).toBeUndefined()
    })

    it('should return undefined when active chain is not in supported chains', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'unsupported-chain'
      } as any)
      const result = HelpersUtil.getActiveNamespaceConnectedToAuth()
      expect(result).toBeUndefined()
    })
  })
})
