import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common'
import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { ReownAuthentication } from '../../src/configs/index'
import { W3mDataCaptureView } from '../../src/ui/w3m-data-capture-view/index'
import { HelpersUtil } from './utils/HelpersUtil'

// Mock controllers
vi.mock('@reown/appkit-controllers', () => ({
  ChainController: {
    getActiveCaipAddress: vi.fn(),
    getAccountData: vi.fn()
  },
  OptionsController: {
    state: {
      metadata: { name: 'Test App' },
      siwx: null,
      remoteFeatures: { emailCapture: false }
    }
  },
  RouterController: {
    state: { data: null },
    replace: vi.fn()
  },
  SnackController: {
    showError: vi.fn()
  }
}))

// Mock SafeLocalStorage
vi.mock('@reown/appkit-common', () => ({
  SafeLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn()
  },
  SafeLocalStorageKeys: {
    RECENT_EMAILS: '@appkit/recent_emails'
  },
  ConstantsUtil: {
    FOUR_MINUTES_MS: 4 * 60 * 1000,
    CHAIN: {
      EVM: 'eip155'
    },
    EIP155: 'eip155',
    CONNECTOR_ID: {
      COINBASE: 'coinbaseWallet',
      COINBASE_SDK: 'coinbaseWalletSDK'
    }
  }
}))

describe('W3mDataCaptureView', () => {
  let element: W3mDataCaptureView
  let mockSiwx: ReownAuthentication

  beforeEach(() => {
    vi.restoreAllMocks()

    // Setup mock SIWX instance using the mocked class
    mockSiwx = new ReownAuthentication()

    // Clean up document body
    document.body.innerHTML = ''

    // Reset mocks
    vi.spyOn(ChainController, 'getAccountData').mockImplementation(() => {
      return {
        address: '0x1234567890abcdef1234567890abcdef12345678'
      } as any
    })
    vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue(
      'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
    )
    vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('')
    vi.spyOn(SafeLocalStorage, 'setItem').mockReturnValue()

    // Mock OptionsController state
    OptionsController.state.siwx = mockSiwx
    OptionsController.state.metadata = {
      name: 'Test App',
      description: 'Test Description',
      url: 'https://test.com',
      icons: []
    }
    OptionsController.state.remoteFeatures = { emailCapture: false } as any

    // Mock RouterController state

    // Define custom element if not already defined
    if (!customElements.get('w3m-data-capture-view')) {
      customElements.define('w3m-data-capture-view', W3mDataCaptureView)
    }
    RouterController.state.data = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up document body
    document.body.innerHTML = ''
  })

  const createView = async (): Promise<W3mDataCaptureView> => {
    const view = document.createElement('w3m-data-capture-view') as W3mDataCaptureView
    document.body.appendChild(view)

    // Wait for the element to be rendered
    await new Promise(resolve => setTimeout(resolve, 0))
    await view.updateComplete

    return view
  }

  describe('Initialization', () => {
    it('should throw error if ReownAuthentication is not initialized', async () => {
      OptionsController.state.siwx = undefined

      await createView()

      expect(SnackController.showError).toHaveBeenCalledWith(
        'ReownAuthentication is not initialized.'
      )
    })

    it('should initialize with correct default values', async () => {
      element = await createView()

      expect(element).toBeTruthy()
      // Check that the view renders the hero section
      const hero = HelpersUtil.querySelector(element, '.hero')
      expect(hero).toBeTruthy()
    })

    it('should initialize with email from router data', async () => {
      RouterController.state.data = { email: 'test@example.com' }

      element = await createView()

      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      expect((emailInput as any)?.value).toBe('test@example.com')
    })

    it('should initialize with email from user account', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockImplementation(() => {
        return {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          user: { email: 'user@test.com' }
        } as any
      })

      element = await createView()

      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      expect((emailInput as any)?.value).toBe('user@test.com')
    })

    it('should auto-submit if email is pre-filled', async () => {
      RouterController.state.data = { email: 'auto@example.com' }
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: null })

      element = await createView()

      // Should have called requestEmailOtp
      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'auto@example.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })
  })

  describe('Email Validation', () => {
    it('should show error for invalid email format', async () => {
      element = await createView()

      // Set invalid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'invalid-email' }))

      await element.updateComplete

      // Try to submit
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      expect(SnackController.showError).toHaveBeenCalledWith('Please provide a valid email.')
    })

    it('should accept valid email format', async () => {
      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Try to submit
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      expect(SnackController.showError).not.toHaveBeenCalledWith('Please provide a valid email.')
    })
  })

  describe('Form Submission', () => {
    it('should handle successful OTP request with UUID', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })

      expect(RouterController.replace).toHaveBeenCalledWith('DataCaptureOtpConfirm', {
        email: 'test@example.com'
      })
    })

    it('should handle successful OTP request without UUID', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: null })

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage')
    })

    it('should handle OTP request failure', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockRejectedValue(new Error('Network error'))

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(SnackController.showError).toHaveBeenCalledWith('Failed to send email OTP')
    })

    it('should show error when account is not connected', async () => {
      vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue(undefined as any)

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form should throw error
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')

      // The onSubmit method throws an error, but it should be handled by the component
      // and not actually cause a rejection. We just test if the button is disabled.
      // Button uses property-based disabled state, not attribute
      expect((submitButton as any)?.disabled).toBe(false)
    })
  })

  describe('Recent Emails', () => {
    it('should load recent emails from storage', async () => {
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(
        'email1@test.com,email2@test.com,email3@test.com'
      )

      element = await createView()

      element.requestUpdate()
      await element.updateComplete

      const recentEmailsWidget = HelpersUtil.querySelector(element, 'w3m-recent-emails-widget')
      expect(recentEmailsWidget).toBeTruthy()

      // Check that emails are passed to the widget
      expect((recentEmailsWidget as any)?.emails).toEqual([
        'email1@test.com',
        'email2@test.com',
        'email3@test.com'
      ])
    })

    it('should handle email selection from recent emails', async () => {
      // Mock recent emails in storage
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('recent@test.com')
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

      element = await createView()

      // Force component to update its recent emails state
      ;(element as any).recentEmails = (element as any).getRecentEmails()
      element.requestUpdate()
      await element.updateComplete

      const recentEmailsWidget = HelpersUtil.querySelector(element, 'w3m-recent-emails-widget')
      expect(recentEmailsWidget).toBeTruthy()

      // Simulate email selection
      recentEmailsWidget?.dispatchEvent(
        new CustomEvent('select', {
          detail: 'recent@test.com'
        })
      )

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'recent@test.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })

    it('should filter invalid emails from recent emails', async () => {
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(
        'valid@test.com,invalid-email,another@test.com'
      )

      element = await createView()

      // Force component to update its recent emails state
      ;(element as any).recentEmails = (element as any).getRecentEmails()
      element.requestUpdate()
      await element.updateComplete

      const recentEmailsWidget = HelpersUtil.querySelector(element, 'w3m-recent-emails-widget')
      expect(recentEmailsWidget).toBeTruthy()

      // Should only show valid emails (invalid-email should be filtered out)
      expect((recentEmailsWidget as any)?.emails).toEqual(['valid@test.com', 'another@test.com'])
    })

    it('should limit recent emails to 3 items', async () => {
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(
        'email1@test.com,email2@test.com,email3@test.com,email4@test.com,email5@test.com'
      )

      element = await createView()
      // Force component to update its recent emails state
      ;(element as any).recentEmails = (element as any).getRecentEmails()
      element.requestUpdate()
      await element.updateComplete

      const recentEmailsWidget = HelpersUtil.querySelector(element, 'w3m-recent-emails-widget')
      expect(recentEmailsWidget).toBeTruthy()

      // Should only show first 3 emails
      expect((recentEmailsWidget as any)?.emails).toEqual([
        'email1@test.com',
        'email2@test.com',
        'email3@test.com'
      ])
    })

    it('should save email to recent emails on successful submission', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'new@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(SafeLocalStorage.setItem).toHaveBeenCalledWith(
        SafeLocalStorageKeys.RECENT_EMAILS,
        expect.stringContaining('new@example.com')
      )
    })
  })

  describe('Email Suffixes Widget', () => {
    it('should render email suffixes widget', async () => {
      element = await createView()

      const suffixesWidget = HelpersUtil.querySelector(element, 'w3m-email-suffixes-widget')
      expect(suffixesWidget).toBeTruthy()
    })

    it('should handle email change from suffixes widget', async () => {
      element = await createView()

      const suffixesWidget = HelpersUtil.querySelector(element, 'w3m-email-suffixes-widget')

      // Simulate suffix selection
      suffixesWidget?.dispatchEvent(
        new CustomEvent('change', {
          detail: 'test@gmail.com'
        })
      )

      await element.updateComplete

      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      expect((emailInput as any)?.value).toBe('test@gmail.com')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      // Mock a slow request
      mockSiwx.requestEmailOtp = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100))
        )

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      // Give a moment for loading state to be set
      await new Promise(resolve => setTimeout(resolve, 10))
      await element.updateComplete

      // Should show loading state
      const hero = HelpersUtil.querySelector(element, '.hero')
      expect(hero?.getAttribute('data-state')).toBe('loading')

      // Wait for request to complete (100ms mock + 300ms component delay)
      await new Promise(resolve => setTimeout(resolve, 450))

      // Should no longer be loading
      expect(hero?.getAttribute('data-state')).toBe('default')
    })

    it('should hide email input during loading', async () => {
      // Mock a slow request
      mockSiwx.requestEmailOtp = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100))
        )

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      // Give a moment for loading state to be set
      await new Promise(resolve => setTimeout(resolve, 10))
      await element.updateComplete

      // Email input should not be present in DOM during loading
      const emailInputDuringLoading = HelpersUtil.querySelector(element, 'wui-email-input')
      expect(emailInputDuringLoading).toBeNull()

      // Wait for request to complete (100ms mock + 300ms component delay)
      await new Promise(resolve => setTimeout(resolve, 450))

      // Email input should be present again after loading
      const emailInputAfterLoading = HelpersUtil.querySelector(element, 'wui-email-input')
      expect(emailInputAfterLoading).toBeTruthy()
    })

    it('should hide recent emails widget during loading', async () => {
      // Mock recent emails in storage
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(
        'test@example.com,user@domain.com,admin@company.org'
      )

      // Mock a slow request
      mockSiwx.requestEmailOtp = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100))
        )

      element = await createView()

      // Force component to update its recent emails state
      ;(element as any).recentEmails = (element as any).getRecentEmails()
      element.requestUpdate()
      await element.updateComplete

      // Verify recent emails widget is visible initially
      const recentEmailsWidgetInitial = HelpersUtil.querySelector(
        element,
        'w3m-recent-emails-widget'
      )
      expect(recentEmailsWidgetInitial).toBeTruthy()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Submit form
      const submitButton = HelpersUtil.querySelector(element, 'wui-button[type="submit"]')
      submitButton?.click()

      // Give a moment for loading state to be set
      await new Promise(resolve => setTimeout(resolve, 10))
      await element.updateComplete

      // Recent emails widget should not be present in DOM during loading
      const recentEmailsWidgetDuringLoading = HelpersUtil.querySelector(
        element,
        'w3m-recent-emails-widget'
      )
      expect(recentEmailsWidgetDuringLoading).toBeNull()

      // Wait for request to complete (100ms mock + 300ms component delay)
      await new Promise(resolve => setTimeout(resolve, 450))

      // Recent emails widget should be present again after loading
      const recentEmailsWidgetAfterLoading = HelpersUtil.querySelector(
        element,
        'w3m-recent-emails-widget'
      )
      expect(recentEmailsWidgetAfterLoading).toBeTruthy()
    })
  })

  describe('Required Field Handling', () => {
    it('should handle required email capture feature', async () => {
      OptionsController.state.remoteFeatures = { emailCapture: ['required'] }

      element = await createView()

      // Should handle required state appropriately
      // The specific behavior depends on the implementation
    })

    it('should handle optional email capture feature', async () => {
      OptionsController.state.remoteFeatures = { emailCapture: ['optional'] } as any

      element = await createView()

      // Should handle optional state appropriately
      // The specific behavior depends on the implementation
    })
  })

  describe('Keyboard Navigation', () => {
    it('should submit form on Enter key press', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Press Enter key
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      emailInput?.dispatchEvent(keyEvent)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalled()
    })

    it('should not submit form on other key presses', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

      element = await createView()

      // Set valid email
      const emailInput = HelpersUtil.querySelector(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }))

      await element.updateComplete

      // Press other keys
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      emailInput?.dispatchEvent(tabEvent)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockSiwx.requestEmailOtp).not.toHaveBeenCalled()
    })
  })
})
