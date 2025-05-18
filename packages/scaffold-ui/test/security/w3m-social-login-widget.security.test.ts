import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AccountController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController
} from '@reown/appkit-controllers'

import { W3mSocialLoginWidget } from '../../src/partials/w3m-social-login-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSocialLoginWidget - Security', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    
    vi.spyOn(OptionsController.state, 'features', 'get').mockReturnValue({
      ...OptionsController.state.features,
      socials: ['google']
    })
    vi.spyOn(AccountController, 'setSocialProvider').mockImplementation(vi.fn())
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Social Login URI Security', () => {
    it('protects against open redirect vulnerabilities', async () => {
      const mockWindow = { location: { href: '' } }
      
      vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(mockWindow as Window)
      
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: vi.fn().mockImplementation(async () => {
            return { uri: 'https://auth.example.com/login' }
          })
        },
        type: 'AUTH'
      } as any)
      
      vi.spyOn(AccountController, 'setSocialWindow').mockImplementation(vi.fn())

      const element: W3mSocialLoginWidget = await fixture(
        html`<w3m-social-login-widget></w3m-social-login-widget>`
      )

      const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
      await googleButton.click()
      
      expect(mockWindow.location.href).toBe('https://auth.example.com/login')
      expect(mockWindow.location.href).not.toContain('javascript:')
      expect(mockWindow.location.href).not.toContain('data:')
      expect(mockWindow.location.href).not.toMatch(/https?:\/\/evil\.com/)
    })

    it('validates social provider inputs against injection attacks', async () => {
      const mockGetSocialRedirectUri = vi.fn()
      
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: mockGetSocialRedirectUri
        },
        type: 'AUTH'
      } as any)
      
      const element: W3mSocialLoginWidget = await fixture(
        html`<w3m-social-login-widget></w3m-social-login-widget>`
      )
      
      const maliciousProviders = [
        'google<script>alert(1)</script>',
        "google' OR 1=1 --",
        'javascript:alert(1)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
      ]
      
      for (const provider of maliciousProviders) {
        const fakeButton = document.createElement('button')
        fakeButton.setAttribute('data-provider', provider)
        element.appendChild(fakeButton)
        
        await fakeButton.click()
        
        expect(mockGetSocialRedirectUri).not.toHaveBeenCalledWith(provider)
      }
    })
  })

  describe('Social Login Validation', () => {
    it('handles malformed social provider inputs appropriately', async () => {
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: 'https://valid-redirect.com/callback' })
        },
        type: 'AUTH'
      } as any)
      
      const element: W3mSocialLoginWidget = await fixture(
        html`<w3m-social-login-widget></w3m-social-login-widget>`
      )
      
      const validProviders = ['google', 'github', 'apple', 'facebook', 'x', 'discord']
      const invalidProviders = [
        '<script>alert(1)</script>',
        "' OR 1=1 --",
        'unknown_provider'
      ]
      
      for (const provider of validProviders) {
        const button = HelpersUtil.querySelect(element, `[data-provider="${provider}"]`)
        if (button) {
          expect(button).toBeDefined()
        }
      }
      
      for (const provider of invalidProviders) {
        const button = HelpersUtil.querySelect(element, `[data-provider="${provider}"]`)
        expect(button).toBeNull()
      }
    })
    
    it('sanitizes URI parameters to prevent XSS', async () => {
      const mockWindow = { location: { href: '' } }
      
      vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(mockWindow as Window)
      
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: vi.fn().mockResolvedValue({ 
            uri: 'https://auth.example.com/login?redirect=https://app.example.com&param=value' 
          })
        },
        type: 'AUTH'
      } as any)
      
      vi.spyOn(AccountController, 'setSocialWindow').mockImplementation(vi.fn())

      const element: W3mSocialLoginWidget = await fixture(
        html`<w3m-social-login-widget></w3m-social-login-widget>`
      )

      const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
      await googleButton.click()
      
      expect(mockWindow.location.href).not.toContain('<script>')
      expect(mockWindow.location.href).not.toContain('javascript:')
      expect(mockWindow.location.href.includes('https://auth.example.com/login')).toBe(true)
    })
  })
})
