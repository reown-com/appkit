import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getApiUrl, getExchanges, getPayUrl } from '../../src/utils/ApiUtil.js'
import { API_URL } from '../../src/utils/ConstantsUtil.js'

// Mock the global fetch function
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('ApiUtil', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => {
    vi.unstubAllGlobals()
  })

  describe('getApiUrl', () => {
    it('should return the correct API URL with projectId', () => {
      // Assuming a default projectId is appended, adjust if needed based on actual implementation
      // Currently it seems hardcoded to 'test'
      expect(getApiUrl()).toBe(`${API_URL}?projectId=test`)
    })
  })

  describe('getExchanges', () => {
    const mockParams = { page: 1 }
    const mockSuccessResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: { exchanges: [{ id: '1', name: 'Test Exchange' }], total: 1 }
    }
    const mockErrorResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32603, message: 'Internal error' }
    }

    it('should call fetch with correct parameters and return exchanges on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      const result = await getExchanges(mockParams)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}?projectId=test`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'reown_getExchanges',
            params: mockParams
          })
        })
      )
      expect(result).toEqual(mockSuccessResponse.result)
    })

    it('should throw JsonRpcError when API returns an error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse
      })

      await expect(getExchanges(mockParams)).rejects.toThrow(mockErrorResponse.error.message)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors during fetch', async () => {
      const networkError = new Error('Network Failed')
      mockFetch.mockRejectedValueOnce(networkError)

      await expect(getExchanges(mockParams)).rejects.toThrow(networkError.message)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getPayUrl', () => {
    const mockParams = {
      exchangeId: 'exchange',
      asset: 'eip155:8453/erc20:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '10',
      recipient: 'eip155:8453:0x81D8C68Be5EcDC5f927eF020Da834AA57cc3Bd24'
    }
    const mockSuccessResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: { url: 'https://pay.example.com/123' }
    }
    const mockErrorResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32603, message: 'Payment URL error' }
    }

    it('should call fetch with correct parameters and return pay URL on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      })

      const result = await getPayUrl(mockParams)

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}?projectId=test`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'reown_getExchangePayUrl',
            params: mockParams
          })
        })
      )
      expect(result).toEqual(mockSuccessResponse.result)
    })

    it('should throw JsonRpcError when API returns an error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse
      })

      await expect(getPayUrl(mockParams)).rejects.toThrow(mockErrorResponse.error.message)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors during fetch', async () => {
      const networkError = new Error('Network Failed')
      mockFetch.mockRejectedValueOnce(networkError)

      await expect(getPayUrl(mockParams)).rejects.toThrow(networkError.message)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})
