import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FetchUtil } from '../../src/utils/FetchUtil'

describe('FetchUtil', () => {
  const mockBaseUrl = 'https://api.example.com'
  const mockClientId = 'test-client-id'
  let fetchUtil: FetchUtil

  beforeEach(() => {
    fetchUtil = new FetchUtil({ baseUrl: mockBaseUrl, clientId: mockClientId })
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('constructor', () => {
    it('should set baseUrl and clientId', () => {
      expect(fetchUtil.baseUrl).toBe(mockBaseUrl)
      expect(fetchUtil.clientId).toBe(mockClientId)
    })
  })

  describe('get', () => {
    it('should make a GET request with correct URL and parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await fetchUtil.get<{ data: string }>({
        path: '/test',
        params: { key: 'value' }
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const mockCall = vi.mocked(global.fetch).mock.calls[0]
      const calledUrl = mockCall?.[0]
      const calledOptions = mockCall?.[1]

      expect(calledUrl?.toString()).toBe(
        'https://api.example.com/test?key=value&clientId=test-client-id'
      )
      expect(calledOptions).toEqual({
        method: 'GET',
        headers: undefined,
        signal: undefined,
        cache: undefined
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      await expect(fetchUtil.get({ path: '/test' })).rejects.toThrow('Network error')
    })
  })

  describe('getBlob', () => {
    it('should make a GET request and return a blob', async () => {
      const mockBlob = new Blob(['test'])
      const mockResponse = {
        ok: true,
        status: 200,
        blob: vi.fn().mockResolvedValue(mockBlob)
      }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await fetchUtil.getBlob({ path: '/test' })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const mockCall = vi.mocked(global.fetch).mock.calls[0]
      const calledUrl = mockCall?.[0]
      const calledOptions = mockCall?.[1]

      expect(calledUrl?.toString()).toBe('https://api.example.com/test?clientId=test-client-id')
      expect(calledOptions).toEqual({
        method: 'GET',
        headers: undefined,
        signal: undefined
      })
      expect(result).toBe(mockBlob)
    })
  })

  describe('post', () => {
    it('should make a POST request with correct body and headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await fetchUtil.post<{ data: string }>({
        path: '/test',
        body: { key: 'value' },
        headers: { 'Content-Type': 'application/json' }
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const mockCall = vi.mocked(global.fetch).mock.calls[0]
      const calledUrl = mockCall?.[0]
      const calledOptions = mockCall?.[1]

      expect(calledUrl?.toString()).toBe('https://api.example.com/test?clientId=test-client-id')
      expect(calledOptions).toEqual({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
        signal: undefined
      })
      expect(result).toEqual({ data: 'test' })
    })
  })

  describe('put', () => {
    it('should make a PUT request with correct body and headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await fetchUtil.put<{ data: string }>({
        path: '/test',
        body: { key: 'value' },
        headers: { 'Content-Type': 'application/json' }
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const mockCall = vi.mocked(global.fetch).mock.calls[0]
      const calledUrl = mockCall?.[0]
      const calledOptions = mockCall?.[1]

      expect(calledUrl?.toString()).toBe('https://api.example.com/test?clientId=test-client-id')
      expect(calledOptions).toEqual({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
        signal: undefined
      })
      expect(result).toEqual({ data: 'test' })
    })
  })

  describe('delete', () => {
    it('should make a DELETE request with correct body and headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      const result = await fetchUtil.delete<{ data: string }>({
        path: '/test',
        body: { key: 'value' },
        headers: { 'Content-Type': 'application/json' }
      })
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const mockCall = vi.mocked(global.fetch).mock.calls[0]
      const calledUrl = mockCall?.[0]
      const calledOptions = mockCall?.[1]

      expect(calledUrl?.toString()).toBe('https://api.example.com/test?clientId=test-client-id')
      expect(calledOptions).toEqual({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
        signal: undefined
      })
      expect(result).toEqual({ data: 'test' })
    })
  })

  describe('createUrl', () => {
    it('should create a URL with correct path and parameters', () => {
      const url = fetchUtil['createUrl']({
        path: '/test',
        params: { key: 'value', empty: undefined }
      })

      expect(url.toString()).toBe('https://api.example.com/test?key=value&clientId=test-client-id')
    })

    it('should handle paths with leading slash', () => {
      const url = fetchUtil['createUrl']({ path: 'test' })

      expect(url.toString()).toBe('https://api.example.com/test?clientId=test-client-id')
    })
  })

  describe('error handling', () => {
    it('should throw an error for non-2xx responses', async () => {
      const mockResponse = { ok: false, status: 404 }
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response)

      await expect(fetchUtil.get({ path: '/test' })).rejects.toThrow('HTTP status code: 404')
    })
  })
})
