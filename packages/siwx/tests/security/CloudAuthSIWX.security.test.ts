import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { CloudAuthSIWX } from '../../src/configs/CloudAuthSIWX.js'
import { mockSession } from '../mocks/mockSession.js'

describe('CloudAuthSIWX - Token Handling Security', () => {
  let siwx: CloudAuthSIWX

  beforeAll(() => {
    global.fetch = vi.fn()
    document.location.host = 'mocked.com'
    document.location.href = 'http://mocked.com/'
  })

  beforeEach(() => {
    siwx = new CloudAuthSIWX()
    vi.resetAllMocks()
  })

  describe('Token validation security', () => {
    it('rejects tampered tokens', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('tampered.jwt.token')
      
      fetchSpy.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Invalid token' }),
        headers: { get: () => 'application/json' }
      } as any)

      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const chainId = 'eip155:1'
      
      const sessions = await siwx.getSessions(chainId, address)
      
      expect(sessions).toEqual([])
      expect(fetchSpy).toHaveBeenCalled()
    })

    it('protects against token injection attempts', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('valid_nonce_token')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ token: 'valid_token' }),
        headers: { get: () => 'application/json' }
      } as any)
      
      const testSession = mockSession({
        data: { 
          accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 'eip155:1'
        }
      })
      
      const sessionWithMalicious = {
        ...testSession,
        data: {
          ...testSession.data,
          malicious: '<script>alert(1)</script>'
        }
      }
      
      await siwx.addSession(sessionWithMalicious)
      
      expect(fetchSpy).toHaveBeenCalled()
      
      if (fetchSpy.mock.calls.length > 0) {
        const fetchCall = fetchSpy.mock.calls[0]
        if (fetchCall && fetchCall[1] && typeof fetchCall[1].body === 'string') {
          const requestBody = JSON.parse(fetchCall[1].body)
          
          expect(requestBody.data.malicious).toBeUndefined()
        }
      }
    })

    it('sanitizes inputs to prevent XSS in createMessage', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ token: 'mock_token', nonce: 'mock_nonce' }),
        headers: { get: () => 'application/json' }
      } as any)
      
      const xssPayload = '0x1234<script>alert(1)</script>'
      
      await expect(
        siwx.createMessage({
          accountAddress: xssPayload,
          chainId: 'eip155:1'
        })
      ).rejects.toThrow()
    })

    it('validates chainId format to prevent injection attacks', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ token: 'mock_token', nonce: 'mock_nonce' }),
        headers: { get: () => 'application/json' }
      } as any)
      
      const maliciousChainIds = [
        'eip155:1;DROP TABLE users',
        'eip155:1 OR 1=1',
        'eip155:<script>alert(1)</script>',
        'javascript:alert(1)',
        '"eip155:1"'
      ]
      
      for (const maliciousChainId of maliciousChainIds) {
        await expect(
          siwx.createMessage({
            accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
            chainId: maliciousChainId
          })
        ).rejects.toThrow()
      }
    })
  })

  describe('Session management security', () => {
    it('prevents session hijacking by validating address and network', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('valid.jwt.token')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ 
          address: '0xdifferentaddress',
          caip2Network: 'eip155:1'
        }),
        headers: { get: () => 'application/json' }
      } as any)

      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const chainId = 'eip155:1'
      
      const sessions = await siwx.getSessions(chainId, address)
      
      expect(sessions).toEqual([])
    })

    it('safely handles malformed session data', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('valid.jwt.token')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ 
          someOtherField: 'value'
        }),
        headers: { get: () => 'application/json' }
      } as any)

      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const chainId = 'eip155:1'
      
      const sessions = await siwx.getSessions(chainId, address)
      
      expect(sessions).toEqual([])
    })

    it('prevents unauthorized session metadata updates', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(null)
      
      await expect(
        siwx.setSessionAccountMetadata({ someData: 'value' })
      ).rejects.toThrow('Not authenticated')
    })
  })

  describe('Storage security', () => {
    it('properly clears sensitive tokens on revoke', async () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, 'removeItem')
      
      await siwx.revokeSession('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')
      
      expect(localStorageSpy).toHaveBeenCalledTimes(2)
    })

    it('handles token storage securely', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      fetchSpy.mockResolvedValueOnce({
        json: async () => ({ token: 'secure.token.value' }),
        headers: { get: () => 'application/json' }
      } as any)
      
      const session = mockSession()
      await siwx.addSession(session)
      
      expect(setItemSpy).toHaveBeenCalledWith(
        expect.any(String), 
        'secure.token.value'
      )
    })
  })
})
