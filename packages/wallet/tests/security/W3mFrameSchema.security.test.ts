import { describe, expect, it } from 'vitest'

import {
  AppConnectEmailRequest,
  AppConnectOtpRequest
} from '../../src/W3mFrameSchema'

describe('W3mFrameSchema - Email Authentication Security', () => {
  describe('AppConnectEmailRequest Validation', () => {
    it('rejects SQL injection attempts in email inputs', () => {
      const sqlInjectionEmails = [
        'user@example.com;DROP TABLE users',
        "user@example.com' OR 1=1 --",
        'user@example.com" OR "1"="1',
        "user'); DROP TABLE users; --",
        "user@example.com'; exec xp_cmdshell('dir'); --"
      ]

      sqlInjectionEmails.forEach(email => {
        const result = AppConnectEmailRequest.safeParse({ email })
        expect(result.success).toBe(false)
      })
    })

    it('rejects XSS attempts in email inputs', () => {
      const xssEmails = [
        'user@example.com<script>alert(1)</script>',
        'user@example.com<img src="x" onerror="alert(1)">',
        'user@example.com javascript:alert(1)',
        'user@example.com"><script>alert(1)</script>',
        'user@example.com\' onmouseover=\'alert(1)\''
      ]

      xssEmails.forEach(email => {
        const result = AppConnectEmailRequest.safeParse({ email })
        expect(result.success).toBe(false)
      })
    })

    it('rejects malformed email formats', () => {
      const malformedEmails = [
        'user@',
        '@example.com',
        'user.example.com',
        'user@example.',
        '.user@example.com',
        'user@.example.com',
        'user@example..com',
        'user@example.com.',
        '',
        ' ',
        'user example@example.com'
      ]

      malformedEmails.forEach(email => {
        const result = AppConnectEmailRequest.safeParse({ email })
        expect(result.success).toBe(false)
      })
    })

    it('rejects emails with invalid special characters', () => {
      const invalidSpecialCharacters = [
        'user()@example.com',
        'user\\@example.com',
        'user[@example.com',
        'user]@example.com',
        'user;@example.com',
        'user:@example.com',
        'user,@example.com',
        'user<@example.com',
        'user>@example.com'
      ]

      invalidSpecialCharacters.forEach(email => {
        const result = AppConnectEmailRequest.safeParse({ email })
        expect(result.success).toBe(false)
      })
    })

    it('rejects emails exceeding maximum length', () => {
      const longLocalPart = 'a'.repeat(65);
      const longDomain = 'b'.repeat(65);
      const longEmail = `${longLocalPart}@${longDomain}.com`;

      const result = AppConnectEmailRequest.safeParse({ email: longEmail })
      expect(result.success).toBe(false)
    })

    it('accepts valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user123@example.com',
        'user@sub.example.com',
        'USER@EXAMPLE.COM'
      ]

      validEmails.forEach(email => {
        const result = AppConnectEmailRequest.safeParse({ email })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('AppConnectOtpRequest Validation', () => {
    it('rejects SQL injection attempts in OTP inputs', () => {
      const sqlInjectionOtps = [
        '123456;DROP TABLE users',
        "123456' OR 1=1 --",
        '123456" OR "1"="1'
      ]

      sqlInjectionOtps.forEach(otp => {
        const result = AppConnectOtpRequest.safeParse({ otp })
        expect(result.success).toBe(false)
      })
    })

    it('rejects XSS attempts in OTP inputs', () => {
      const xssOtps = [
        '12<script>alert(1)</script>34',
        '12<img src="x" onerror="alert(1)">34',
        '123456 javascript:alert(1)'
      ]

      xssOtps.forEach(otp => {
        const result = AppConnectOtpRequest.safeParse({ otp })
        expect(result.success).toBe(false)
      })
    })

    it('rejects malformed OTP formats', () => {
      const malformedOtps = [
        '',
        ' ',
        '12345', // too short
        '1234567', // too long
        'abcdef', // not numeric
        '12 345', // contains space
        '12.345', // contains special character
      ]

      malformedOtps.forEach(otp => {
        const result = AppConnectOtpRequest.safeParse({ otp })
        expect(result.success).toBe(false)
      })
    })

    it('accepts valid OTP formats', () => {
      const validOtps = [
        '123456',
        '000000',
        '999999'
      ]

      validOtps.forEach(otp => {
        const result = AppConnectOtpRequest.safeParse({ otp })
        expect(result.success).toBe(true)
      })
    })
  })
})
