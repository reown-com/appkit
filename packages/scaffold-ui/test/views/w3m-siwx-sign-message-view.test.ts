import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { RouterController, SIWXUtil, SnackController } from '@reown/appkit-controllers'

import { W3mSIWXSignMessageView } from '../../src/views/w3m-siwx-sign-message-view/index'

// --- Constants ---------------------------------------------------- //
const SIGN_BUTTON_SELECTOR = '[data-testid="w3m-connecting-siwe-sign"]'
const CANCEL_BUTTON_SELECTOR = '[data-testid="w3m-connecting-siwe-cancel"]'

// --- Helpers ------------------------------------------------------ //
function createDeferred() {
  let resolve: () => void = () => {}
  let reject: (error: Error) => void = () => {}
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function getButton(element: W3mSIWXSignMessageView, selector: string) {
  const button = element.shadowRoot?.querySelector<HTMLElement>(selector)
  if (!button) {
    throw new Error(`Button not found: ${selector}`)
  }

  return button
}

beforeAll(() => {
  Element.prototype.animate = vi.fn()
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

describe('W3mSIWXSignMessageView', () => {
  let element: W3mSIWXSignMessageView

  beforeEach(async () => {
    vi.restoreAllMocks()

    vi.spyOn(RouterController, 'replace').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

    element = await fixture(html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`)
  })

  describe('Sign button', () => {
    it('should start a single sign request when Sign is clicked repeatedly while signing', async () => {
      const deferred = createDeferred()
      const requestSignMessage = vi
        .spyOn(SIWXUtil, 'requestSignMessage')
        .mockReturnValue(deferred.promise)
      const signButton = getButton(element, SIGN_BUTTON_SELECTOR)

      signButton.click()
      await element.updateComplete
      signButton.click()
      await element.updateComplete
      signButton.click()
      await element.updateComplete

      expect(requestSignMessage).toHaveBeenCalledTimes(1)

      deferred.resolve()
    })

    it('should disable the Sign button while signing and enable it again once signing settles', async () => {
      const deferred = createDeferred()
      vi.spyOn(SIWXUtil, 'requestSignMessage').mockReturnValue(deferred.promise)
      const signButton = getButton(element, SIGN_BUTTON_SELECTOR)

      signButton.click()
      await element.updateComplete

      expect(signButton.hasAttribute('disabled')).toBe(true)

      deferred.resolve()
      await deferred.promise
      await element.updateComplete

      expect(signButton.hasAttribute('disabled')).toBe(false)
    })

    it('should enable Sign again and allow a new request after a failed attempt', async () => {
      const requestSignMessage = vi
        .spyOn(SIWXUtil, 'requestSignMessage')
        .mockRejectedValueOnce(new Error('boom'))
        .mockReturnValueOnce(new Promise<void>(() => {}))
      const signButton = getButton(element, SIGN_BUTTON_SELECTOR)

      await expect(element['onSign']()).rejects.toThrow('boom')
      await element.updateComplete

      expect(signButton.hasAttribute('disabled')).toBe(false)

      signButton.click()
      await element.updateComplete

      expect(requestSignMessage).toHaveBeenCalledTimes(2)
    })

    it('should reset signing state and route to DataCapture when OTP is required', async () => {
      vi.spyOn(SIWXUtil, 'requestSignMessage').mockRejectedValue(new Error('OTP is required'))
      const signButton = getButton(element, SIGN_BUTTON_SELECTOR)

      await element['onSign']()
      await element.updateComplete

      expect(RouterController.replace).toHaveBeenCalledWith('DataCapture')
      expect(SnackController.showError).toHaveBeenCalled()
      expect(signButton.hasAttribute('disabled')).toBe(false)
    })

    it('should keep Cancel enabled while signing', async () => {
      const deferred = createDeferred()
      vi.spyOn(SIWXUtil, 'requestSignMessage').mockReturnValue(deferred.promise)
      const signButton = getButton(element, SIGN_BUTTON_SELECTOR)
      const cancelButton = getButton(element, CANCEL_BUTTON_SELECTOR)

      signButton.click()
      await element.updateComplete

      expect(cancelButton.hasAttribute('disabled')).toBe(false)

      deferred.resolve()
    })
  })

  describe('Cancel button', () => {
    it('should start a single cancel request when Cancel is clicked repeatedly while cancelling', async () => {
      const deferred = createDeferred()
      const cancelSignMessage = vi
        .spyOn(SIWXUtil, 'cancelSignMessage')
        .mockReturnValue(deferred.promise)
      const cancelButton = getButton(element, CANCEL_BUTTON_SELECTOR)

      cancelButton.click()
      await element.updateComplete
      cancelButton.click()
      await element.updateComplete

      expect(cancelSignMessage).toHaveBeenCalledTimes(1)
      expect(cancelButton.hasAttribute('disabled')).toBe(true)

      deferred.resolve()
    })
  })
})
