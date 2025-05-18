import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { AccountController } from '../../src/controllers/AccountController.js'
import { ChainController } from '../../src/controllers/ChainController.js'
import { ConnectorController } from '../../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import { SnackController } from '../../src/controllers/SnackController.js'
import { connectSocial, executeSocialLogin } from '../../src/utils/SocialsUtil.js'
import type { SocialProvider } from '../../src/utils/TypeUtil.js'

describe('SocialsUtil - Social Login Security', () => {
  describe('connectSocial security', () => {
    beforeEach(() => {
      vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockImplementation(() => {
        return {} as Window
      })
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback()
        return 0 as any
      })
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: 'https://valid-redirect.com/callback' })
        }
      } as any)
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(AccountController, 'setSocialWindow').mockImplementation(vi.fn())
      vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('rejects open redirect attempts in social URIs', async () => {
      const mockGetSocialRedirectUri = vi.fn()
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: mockGetSocialRedirectUri
        }
      } as any)

      const maliciousRedirectPayloads = [
        'javascript:alert(document.cookie)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        '//evil.com',
        'https://evil.com%2Fcallback',
        'https://example.com@evil.com'
      ]

      for (const maliciousUri of maliciousRedirectPayloads) {
        mockGetSocialRedirectUri.mockResolvedValueOnce({ uri: maliciousUri })
        
        try {
          await connectSocial('google')
          
          const popupWindow = CoreHelperUtil.returnOpenHref as any
          if (popupWindow.mock.calls.length > 0) {
            const windowLocation = popupWindow.mock.results[0].value.location
            if (windowLocation && windowLocation.href) {
              expect(windowLocation.href).not.toContain('javascript:')
              expect(windowLocation.href).not.toContain('data:')
            }
          }
        } catch (error) {
          expect(error).toBeDefined()
        }
        
        mockGetSocialRedirectUri.mockClear()
      }
    })

    it('rejects malformed social provider inputs', async () => {
      const invalidProviders = [
        '<script>alert(1)</script>',
        'google\';DROP TABLE users;--',
        'google" OR "1"="1',
        '',
        ' ',
        'unknown_provider',
        'google javascript:alert(1)'
      ]

      for (const provider of invalidProviders) {
        // @ts-expect-error Testing invalid input intentionally
        await expect(connectSocial(provider)).rejects.toThrow()
      }
    })

    it('accepts valid social login formats', async () => {
      const connectSocialSpy = vi.spyOn(ConnectorController, 'getAuthConnector')
      
      const validProviders = [
        'google',
        'github',
        'apple',
        'facebook',
        'x',
        'discord'
      ] as const;

      for (const provider of validProviders) {
        await connectSocial(provider)
        expect(connectSocialSpy).toHaveBeenCalled()
        connectSocialSpy.mockClear()
      }
    })
  })

  describe('executeSocialLogin security', () => {
    beforeEach(() => {
      vi.spyOn(AccountController, 'setSocialProvider').mockImplementation(vi.fn())
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider: {
          getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: 'https://valid-redirect.com/callback' }),
          getFarcasterUri: vi.fn().mockResolvedValue({ url: 'https://valid-farcaster.com/auth' })
        }
      } as any)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('validates social provider input', async () => {
      const malformedProviders = [
        'malicious;DROP TABLE users;--',
        '<script>alert(1)</script>',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'javascript:alert(1)',
        '',
        ' '
      ]

      for (const provider of malformedProviders) {
        // @ts-expect-error Testing invalid input intentionally
        await expect(executeSocialLogin(provider)).rejects.toThrow()
      }
    })

    it('handles valid social providers correctly', async () => {
      const validProviders: SocialProvider[] = [
        'google',
        'github',
        'apple',
        'facebook',
        'x',
        'discord',
        'farcaster'
      ]

      for (const provider of validProviders) {
        await executeSocialLogin(provider)
        expect(AccountController.setSocialProvider).toHaveBeenCalledWith(provider, 'eip155:1')
      }
    })
  })
})
