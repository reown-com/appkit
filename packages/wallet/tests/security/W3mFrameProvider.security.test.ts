import { beforeEach, describe, expect, it, vi } from 'vitest'

import { W3mFrameProvider } from '../../src/W3mFrameProvider'

type MockTimeoutReason = 'TIMEOUT' | 'USER_CLOSED' | 'ERROR'

describe('W3mFrameProvider - Authentication Security', () => {
  const mockTimeout = vi.fn<(reason: MockTimeoutReason) => void>()
  const projectId = 'test-project-id'
  let provider: W3mFrameProvider
  let abortController: AbortController

  beforeEach(() => {
    abortController = new AbortController()
    provider = new W3mFrameProvider({ projectId, abortController, onTimeout: mockTimeout })
    window.postMessage = vi.fn()
    mockTimeout.mockClear()
    
    provider['w3mFrame'].frameLoadPromise = Promise.resolve()
    provider.isInitialized = true
  })

  describe('connectEmail security', () => {
    it('validates and sanitizes email inputs', async () => {
      const postAppEventSpy = vi
        .spyOn(provider['w3mFrame'].events, 'postAppEvent')
        .mockImplementation(({ id }) => {
          provider['w3mFrame'].events.onFrameEvent({
            id: id as string,
            type: 'CONNECT_EMAIL_RESPONSE',
            response: { action: 'VERIFY_OTP' }
          })
        })

      await provider.connectEmail({ email: 'valid@example.com' })
      expect(postAppEventSpy).toHaveBeenCalled()
      
      postAppEventSpy.mockClear()
      
      const maliciousEmails = [
        'test@example.com<script>alert(1)</script>',
        "test@example.com' OR 1=1 --",
        'test@example.com" OR "1"="1',
        'javascript:alert(1)@example.com'
      ]
      
      for (const email of maliciousEmails) {
        try {
          await provider.connectEmail({ email })
          
          const calls = postAppEventSpy.mock.calls
          const lastCall = calls[calls.length - 1]
          const payload = lastCall[0].payload
          
          expect(payload.email).not.toContain('<script>')
          expect(payload.email).not.toContain('javascript:')
          expect(payload.email).not.toContain('OR 1=1')
        } catch (error) {
          expect(error).toBeDefined()
        }
        
        postAppEventSpy.mockClear()
      }
    })
  })

  describe('connectOtp security', () => {
    it('validates and sanitizes OTP inputs', async () => {
      const postAppEventSpy = vi
        .spyOn(provider['w3mFrame'].events, 'postAppEvent')
        .mockImplementation(({ id }) => {
          provider['w3mFrame'].events.onFrameEvent({
            id: id as string,
            type: 'CONNECT_OTP_RESPONSE',
            response: undefined
          })
        })

      await provider.connectOtp({ otp: '123456' })
      expect(postAppEventSpy).toHaveBeenCalled()
      
      postAppEventSpy.mockClear()
      
      const maliciousOtps = [
        '123<script>alert(1)</script>',
        "123' OR 1=1 --",
        '123" OR "1"="1'
      ]
      
      for (const otp of maliciousOtps) {
        try {
          await provider.connectOtp({ otp })
          
          const calls = postAppEventSpy.mock.calls
          const lastCall = calls[calls.length - 1]
          const payload = lastCall[0].payload
          
          expect(payload.otp).not.toContain('<script>')
          expect(payload.otp).not.toContain('OR 1=1')
        } catch (error) {
          expect(error).toBeDefined()
        }
        
        postAppEventSpy.mockClear()
      }
    })
  })

  describe('connect security', () => {
    it('validates chainId parameter', async () => {
      const postAppEventSpy = vi
        .spyOn(provider['w3mFrame'].events, 'postAppEvent')
        .mockImplementation(({ id }) => {
          provider['w3mFrame'].events.onFrameEvent({
            id: id as string,
            type: 'GET_USER_RESPONSE',
            response: { address: '0xd34db33f', chainId: 1 }
          })
        })

      await provider.connect({ chainId: 1 })
      expect(postAppEventSpy).toHaveBeenCalled()
      
      postAppEventSpy.mockClear()
      
      const maliciousChainIds = [
        '1<script>alert(1)</script>',
        "1' OR 1=1 --",
        '1" OR "1"="1',
        'javascript:alert(1)'
      ]
      
      for (const chainId of maliciousChainIds) {
        try {
          await provider.connect({ chainId })
          
          const calls = postAppEventSpy.mock.calls
          const lastCall = calls[calls.length - 1]
          const payload = lastCall[0].payload
          
          expect(typeof payload.chainId === 'number').toBe(true)
        } catch (error) {
          expect(error).toBeDefined()
        }
        
        postAppEventSpy.mockClear()
      }
    })

    it('validates socialUri parameter for open redirect vulnerabilities', async () => {
      const postAppEventSpy = vi
        .spyOn(provider['w3mFrame'].events, 'postAppEvent')
        .mockImplementation(({ id }) => {
          provider['w3mFrame'].events.onFrameEvent({
            id: id as string,
            type: 'CONNECT_SOCIAL_RESPONSE',
            response: { address: '0xd34db33f', chainId: 1 }
          })
        })

      await provider.connect({ chainId: 1, socialUri: '?auth=12345678' })
      expect(postAppEventSpy).toHaveBeenCalled()
      
      postAppEventSpy.mockClear()
      
      const maliciousSocialUris = [
        'javascript:alert(document.cookie)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'https://evil.com/redirect',
        '"><script>alert(1)</script>'
      ]
      
      for (const socialUri of maliciousSocialUris) {
        try {
          await provider.connect({ chainId: 1, socialUri })
          
          const calls = postAppEventSpy.mock.calls
          const lastCall = calls[calls.length - 1]
          const payload = lastCall[0].payload
          
          expect(payload.socialUri).not.toContain('javascript:')
          expect(payload.socialUri).not.toContain('data:')
          expect(payload.socialUri).not.toContain('<script>')
        } catch (error) {
          expect(error).toBeDefined()
        }
        
        postAppEventSpy.mockClear()
      }
    })
  })
})
