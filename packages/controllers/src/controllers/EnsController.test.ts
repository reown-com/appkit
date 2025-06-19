import { describe, expect, test, vi } from 'vitest'
import { EnsController } from './EnsController.js'
import { BlockchainApiController } from './BlockchainApiController.js'

vi.mock('./BlockchainApiController.js', () => ({
  BlockchainApiController: {
    lookupEnsName: vi.fn(),
    getEnsNameSuggestions: vi.fn(),
    reverseLookupEnsName: vi.fn(),
    registerEnsName: vi.fn()
  }
}))

describe('EnsController', () => {
  describe('resolveName', () => {
    test('should return empty addresses for .ccmc domains without calling API', async () => {
      const lookupSpy = vi.spyOn(BlockchainApiController, 'lookupEnsName')
      
      const result = await EnsController.resolveName('nacho.ccmc')
      
      expect(result).toEqual({ addresses: {} })
      expect(lookupSpy).not.toHaveBeenCalled()
    })

    test('should return empty addresses for invalid.ccmc without calling API', async () => {
      const lookupSpy = vi.spyOn(BlockchainApiController, 'lookupEnsName')
      
      const result = await EnsController.resolveName('invalid.ccmc')
      
      expect(result).toEqual({ addresses: {} })
      expect(lookupSpy).not.toHaveBeenCalled()
    })

    test('should call API for non-ccmc domains', async () => {
      const mockResponse = { addresses: {}, attributes: [] }
      const lookupSpy = vi.spyOn(BlockchainApiController, 'lookupEnsName').mockResolvedValue(mockResponse)
      
      const result = await EnsController.resolveName('test.eth')
      
      expect(result).toEqual(mockResponse)
      expect(lookupSpy).toHaveBeenCalledWith('test.eth')
    })
  })

  describe('isNameRegistered', () => {
    test('should return false for .ccmc domains without calling API', async () => {
      const lookupSpy = vi.spyOn(BlockchainApiController, 'lookupEnsName')
      
      const result = await EnsController.isNameRegistered('nacho.ccmc')
      
      expect(result).toBe(false)
      expect(lookupSpy).not.toHaveBeenCalled()
    })

    test('should call API for non-ccmc domains', async () => {
      const lookupSpy = vi.spyOn(BlockchainApiController, 'lookupEnsName').mockResolvedValue({ addresses: {}, attributes: [] })
      
      const result = await EnsController.isNameRegistered('test.eth')
      
      expect(result).toBe(true)
      expect(lookupSpy).toHaveBeenCalledWith('test.eth')
    })
  })

  describe('getSuggestions', () => {
    test('should return empty suggestions for .ccmc domains without calling API', async () => {
      const suggestionsSpy = vi.spyOn(BlockchainApiController, 'getEnsNameSuggestions')
      
      const result = await EnsController.getSuggestions('nacho.ccmc')
      
      expect(result).toEqual([])
      expect(suggestionsSpy).not.toHaveBeenCalled()
    })

    test('should call API for non-ccmc domains', async () => {
      const mockResponse = { suggestions: [{ name: 'test.eth', registered: true }] }
      const suggestionsSpy = vi.spyOn(BlockchainApiController, 'getEnsNameSuggestions').mockResolvedValue(mockResponse)
      
      const result = await EnsController.getSuggestions('test')
      
      expect(result).toEqual([{ name: 'test.eth', registered: true }])
      expect(suggestionsSpy).toHaveBeenCalledWith('test')
    })
  })

  describe('validateName', () => {
    test('should validate nacho.ccmc as true', () => {
      const result = EnsController.validateName('nacho.ccmc')
      expect(result).toBe(true)
    })

    test('should validate invalid.ccmc as true', () => {
      const result = EnsController.validateName('invalid.ccmc')
      expect(result).toBe(true)
    })

    test('should validate unknown.ccmc as false', () => {
      const result = EnsController.validateName('unknown.ccmc')
      expect(result).toBe(false)
    })

    test('should validate regular names using existing logic', () => {
      expect(EnsController.validateName('test')).toBe(true)
      expect(EnsController.validateName('ab')).toBe(false)
    })
  })

  describe('registerName', () => {
    test('should throw error for .ccmc domains', async () => {
      await expect(EnsController.registerName('nacho.ccmc' as any)).rejects.toThrow('CCMC domains cannot be registered')
    })
  })
})
