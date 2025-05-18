import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConnectorController, EventsController, RouterController } from '@reown/appkit-controllers'

import { W3mEmailLoginWidget } from '../../src/partials/w3m-email-login-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mEmailLoginWidget - Security', () => {
  const mockAuthConnector = {
    provider: {
      connectEmail: vi.fn()
    }
  }

  beforeEach(() => {
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(
      mockAuthConnector as any
    )
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
  })


  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Email Input Sanitization', () => {
    it('sanitizes email input to prevent XSS attacks', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const xssEmail = 'test@example.com<script>alert(1)</script>'
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: xssEmail }))

      await elementUpdated(element)
      
      expect(element.email).not.toContain('<script>')
      expect(element.email).toBe('test@example.com')
    })

    it('sanitizes email input to prevent SQL injection', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const sqlInjectionEmail = "test@example.com' OR 1=1 --"
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: sqlInjectionEmail }))

      await elementUpdated(element)
      
      expect(element.email).not.toContain("' OR 1=1 --")
    })

    it('handles malformed email formats appropriately', async () => {
      mockAuthConnector.provider.connectEmail.mockRejectedValue(new Error('Invalid email'))

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

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

      for (const email of malformedEmails) {
        const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
        emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: email }))
        await elementUpdated(element)
        
        const form = HelpersUtil.querySelect(element, 'form')
        await form?.dispatchEvent(new Event('submit'))
        
        element.requestUpdate()
        await elementUpdated(element)
        
        const errorText = HelpersUtil.querySelect(element, 'wui-text')
        expect(errorText?.textContent?.trim()).toBe('Invalid email. Try again.')
      }
    })

    it('properly handles boundary testing for email length', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const longLocalPart = 'a'.repeat(65);
      const longDomain = 'b'.repeat(65);
      const longEmail = `${longLocalPart}@${longDomain}.com`;

      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: longEmail }))

      await elementUpdated(element)
      
      expect(element.email.length).toBeLessThan(longEmail.length)
    })
  })

  describe('Form Submission Security', () => {
    it('prevents form submission with malicious email inputs', async () => {
      mockAuthConnector.provider.connectEmail.mockRejectedValue(new Error('Invalid email'))

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const maliciousEmails = [
        'test@example.com<script>alert(1)</script>',
        "test@example.com' OR 1=1 --",
        'test@example.com" OR "1"="1',
        'javascript:alert(1)@example.com'
      ]

      for (const email of maliciousEmails) {
        const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
        emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: email }))
        await elementUpdated(element)
        
        const form = HelpersUtil.querySelect(element, 'form')
        await form?.dispatchEvent(new Event('submit'))
        
        if (mockAuthConnector.provider.connectEmail.mock.calls.length > 0) {
          const lastCall = mockAuthConnector.provider.connectEmail.mock.calls[mockAuthConnector.provider.connectEmail.mock.calls.length - 1]
          if (lastCall && lastCall[0]) {
            const emailParam = lastCall[0].email
            
            expect(emailParam).not.toContain('<script>')
            expect(emailParam).not.toContain('javascript:')
            expect(emailParam).not.toContain("' OR 1=1 --")
          }
        }
        
        mockAuthConnector.provider.connectEmail.mockClear()
      }
    })
  })
})
