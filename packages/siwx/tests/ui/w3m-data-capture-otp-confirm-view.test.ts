import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { ReownAuthentication } from '../../src/configs/index'
import { W3mDataCaptureOtpConfirmView } from '../../src/ui/w3m-data-capture-otp-confirm-view/index'

// Mock ReownAuthentication class
const mockConfirmEmailOtp = vi.fn().mockResolvedValue(true)
const mockRequestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' })

vi.mock('../../src/configs/index', () => ({
  ReownAuthentication: vi.fn().mockImplementation(() => ({
    confirmEmailOtp: mockConfirmEmailOtp,
    requestEmailOtp: mockRequestEmailOtp
  }))
}))

// Mock controllers
vi.mock('@reown/appkit-controllers', () => ({
  ChainController: {
    getAccountData: vi.fn()
  },
  OptionsController: {
    state: {
      siwx: null
    }
  },
  RouterController: {
    state: {
      data: { email: 'test@example.com' }
    },
    replace: vi.fn()
  },
  ConnectorController: {
    getAuthConnector: vi.fn()
  },
  SnackController: {
    showError: vi.fn()
  }
}))

describe('W3mDataCaptureOtpConfirmView', () => {
  let element: W3mDataCaptureOtpConfirmView
  let mockSiwx: ReownAuthentication

  beforeEach(() => {
    vi.restoreAllMocks()

    // Reset the global mock functions
    mockConfirmEmailOtp.mockResolvedValue(true)
    mockRequestEmailOtp.mockResolvedValue({ uuid: 'test-uuid' })

    // Setup mock SIWX instance using the mocked class
    mockSiwx = new ReownAuthentication()
    // Ensure the instance has the mock methods
    mockSiwx.confirmEmailOtp = mockConfirmEmailOtp
    mockSiwx.requestEmailOtp = mockRequestEmailOtp

    // Define custom element if not already defined
    if (!customElements.get('w3m-data-capture-otp-confirm-view')) {
      customElements.define('w3m-data-capture-otp-confirm-view', W3mDataCaptureOtpConfirmView)
    }

    // Clean up document body
    document.body.innerHTML = ''

    // Reset mocks
    vi.mocked(ChainController.getAccountData).mockReturnValue({
      caipAddress: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
    } as any)

    // Mock OptionsController state
    OptionsController.state.siwx = mockSiwx as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up document body
    document.body.innerHTML = ''
  })

  const createView = async (): Promise<W3mDataCaptureOtpConfirmView> => {
    const view = document.createElement(
      'w3m-data-capture-otp-confirm-view'
    ) as W3mDataCaptureOtpConfirmView
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

    it('should initialize correctly with valid SIWX instance', async () => {
      element = await createView()

      expect(element).toBeTruthy()
      // Should inherit from W3mEmailOtpWidget
      expect(element.tagName.toLowerCase()).toBe('w3m-data-capture-otp-confirm-view')
    })

    it('should throw error if SIWX is not instance of ReownAuthentication', async () => {
      OptionsController.state.siwx = {} as any

      await createView()

      expect(SnackController.showError).toHaveBeenCalledWith(
        'ReownAuthentication is not initialized.'
      )
    })
  })

  describe('OTP Submission', () => {
    it('should call confirmEmailOtp when OTP is submitted', async () => {
      element = await createView()

      // Mock the onOtpSubmit method
      const otpCode = '123456'
      await element.onOtpSubmit(otpCode)

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledWith({ code: otpCode })
      expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage')
    })

    it('should handle successful OTP confirmation', async () => {
      mockSiwx.confirmEmailOtp = vi.fn().mockResolvedValue(true as any)

      element = await createView()

      await element.onOtpSubmit('654321')

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledWith({ code: '654321' })
      expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage')
    })

    it('should handle OTP confirmation failure', async () => {
      const error = new Error('Invalid OTP')
      mockSiwx.confirmEmailOtp = vi.fn().mockRejectedValue(error)

      element = await createView()

      await expect(element.onOtpSubmit('000000')).rejects.toThrow('Invalid OTP')

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledWith({ code: '000000' })
      expect(RouterController.replace).not.toHaveBeenCalled()
    })

    it('should handle empty OTP code', async () => {
      element = await createView()

      await element.onOtpSubmit('')

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledWith({ code: '' })
    })

    it('should handle special characters in OTP', async () => {
      element = await createView()

      const specialOtp = '12-34-56'
      await element.onOtpSubmit(specialOtp)

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledWith({ code: specialOtp })
    })
  })

  describe('OTP Resend', () => {
    it('should call requestEmailOtp when resend is triggered', async () => {
      element = await createView()

      const email = 'test@example.com'
      await element.onOtpResend(email)

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email,
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })

    it('should handle successful OTP resend', async () => {
      mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'new-uuid' })

      element = await createView()

      await element.onOtpResend('resend@test.com')

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'resend@test.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })

    it('should handle OTP resend failure', async () => {
      const error = new Error('Network error')
      mockSiwx.requestEmailOtp = vi.fn().mockRejectedValue(error)

      element = await createView()

      await expect(element.onOtpResend('fail@test.com')).rejects.toThrow('Network error')

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'fail@test.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })

    it('should throw error when account data is not available', async () => {
      vi.mocked(ChainController.getAccountData).mockReturnValue(undefined)

      element = await createView()

      await expect(element.onOtpResend('test@example.com')).rejects.toThrow('No account data found')
    })

    it('should throw error when caipAddress is not available', async () => {
      vi.mocked(ChainController.getAccountData).mockReturnValue({} as any)

      element = await createView()

      await expect(element.onOtpResend('test@example.com')).rejects.toThrow('No account data found')
    })

    it('should handle different email formats', async () => {
      element = await createView()

      const emails = [
        'simple@test.com',
        'user.name+tag@example.org',
        'test123@subdomain.domain.co.uk'
      ]

      for (const email of emails) {
        await element.onOtpResend(email)

        expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
          email,
          account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
        })
      }

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledTimes(emails.length)
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout')
      mockSiwx.confirmEmailOtp = vi.fn().mockRejectedValue(timeoutError)

      element = await createView()

      await expect(element.onOtpSubmit('123456')).rejects.toThrow('Request timeout')
    })

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error')
      mockSiwx.requestEmailOtp = vi.fn().mockRejectedValue(serverError)

      element = await createView()

      await expect(element.onOtpResend('test@example.com')).rejects.toThrow('Internal server error')
    })

    it('should handle malformed responses', async () => {
      mockSiwx.confirmEmailOtp = vi.fn().mockResolvedValue(null as any)

      element = await createView()

      // Should still navigate even with malformed response
      await element.onOtpSubmit('123456')

      expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage')
    })
  })

  describe('Integration with Parent Widget', () => {
    it('should inherit OTP widget functionality', async () => {
      element = await createView()

      // Should have inherited methods from W3mEmailOtpWidget
      expect(typeof element.onOtpSubmit).toBe('function')
      expect(typeof element.onOtpResend).toBe('function')
    })

    it('should override onOtpSubmit correctly', async () => {
      element = await createView()

      // The overridden method should call SIWX methods
      await element.onOtpSubmit('123456')

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalled()
      expect(RouterController.replace).toHaveBeenCalled()
    })

    it('should override onOtpResend correctly', async () => {
      element = await createView()

      // The overridden method should call SIWX methods with account data
      await element.onOtpResend('test@example.com')

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
      })
    })
  })

  describe('State Management', () => {
    it('should maintain SIWX instance reference', async () => {
      element = await createView()

      // Access private property for testing
      // @ts-ignore
      expect(element.siwx).toBe(mockSiwx)
    })

    it('should handle SIWX instance changes', async () => {
      element = await createView()

      // Change SIWX instance
      const newMockSiwx = {
        confirmEmailOtp: vi.fn().mockResolvedValue(true),
        requestEmailOtp: vi.fn().mockResolvedValue({ uuid: 'new-uuid' })
      } as unknown as ReownAuthentication

      OptionsController.state.siwx = newMockSiwx as ReownAuthentication

      // The component should use the updated instance
      // Note: This would require component to reactively update to state changes
    })
  })

  describe('Async Operations', () => {
    it('should handle concurrent OTP submissions', async () => {
      element = await createView()

      // Submit multiple OTPs concurrently
      const promises = [
        element.onOtpSubmit('123456'),
        element.onOtpSubmit('654321'),
        element.onOtpSubmit('111111')
      ]

      await Promise.all(promises)

      expect(mockSiwx.confirmEmailOtp).toHaveBeenCalledTimes(3)
      expect(RouterController.replace).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent resend requests', async () => {
      element = await createView()

      // Send multiple resend requests concurrently
      const promises = [
        element.onOtpResend('test1@example.com'),
        element.onOtpResend('test2@example.com'),
        element.onOtpResend('test3@example.com')
      ]

      await Promise.all(promises)

      expect(mockSiwx.requestEmailOtp).toHaveBeenCalledTimes(3)
    })

    it('should handle slow network responses', async () => {
      // Mock slow response
      mockSiwx.confirmEmailOtp = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(true as any), 1000))
        )

      element = await createView()

      const startTime = Date.now()
      await element.onOtpSubmit('123456')
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(1000)
      expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage')
    })
  })
})
