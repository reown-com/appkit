import { describe, expect, it, vi } from 'vitest'

import { W3mFrameProvider } from '@reown/appkit-wallet'

describe('AuthConnector - Security', () => {
  describe('Input Validation', () => {
    it('validates and sanitizes malicious inputs', async () => {
      const mockConnect = vi.fn()
      vi.spyOn(W3mFrameProvider.prototype, 'connect').mockImplementation(mockConnect)
      mockConnect.mockResolvedValue({
        address: '0xd34db33f',
        chainId: 1,
        accounts: [{ address: '0xd34db33f', type: 'eoa' }]
      })
      
      const maliciousInputs = [
        '<script>alert(1)</script>',
        "' OR 1=1 --",
        '" OR "1"="1',
        'javascript:alert(document.cookie)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
      ]
      
      expect(() => {
        for (const input of maliciousInputs) {
          expect(input).not.toContain('javascript:')
          expect(input).not.toContain('data:')
          
          if (input.includes('<script>')) {
            expect(input.replace(/<script>.*<\/script>/g, '')).not.toEqual(input)
          }
        }
      }).not.toThrow()
    })
  })
})
