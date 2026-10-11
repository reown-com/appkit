import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { SIWXUtil } from '@reown/appkit-controllers'

import { W3mSIWXSignMessageView } from '../../src/views/w3m-siwx-sign-message-view/index'

// --- Helpers ------------------------------------------------------ //
async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))

  Element.prototype.animate = vi.fn() as unknown as typeof Element.prototype.animate
})

describe('W3mSIWXSignMessageView', () => {
  let element: W3mSIWXSignMessageView

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.spyOn(SIWXUtil, 'requestSignMessage').mockResolvedValue(undefined)
    vi.spyOn(SIWXUtil, 'cancelSignMessage').mockResolvedValue(undefined)

    element = await fixture(html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`)
  })

  function getSignButton() {
    return element.shadowRoot?.querySelector('[data-testid="w3m-connecting-siwe-sign"]') as
      | (HTMLElement & { disabled: boolean })
      | null
  }

  function getCancelButton() {
    return element.shadowRoot?.querySelector('[data-testid="w3m-connecting-siwe-cancel"]') as
      | (HTMLElement & { disabled: boolean })
      | null
  }

  it('should not start another signature request while one is already in flight', async () => {
    const pending = deferred<void>()
    vi.spyOn(SIWXUtil, 'requestSignMessage').mockReturnValue(pending.promise)

    const signButton = getSignButton()
    expect(signButton).not.toBeNull()
    expect(signButton?.disabled).toBe(false)

    signButton?.click()
    signButton?.click()
    signButton?.click()

    expect(SIWXUtil.requestSignMessage).toHaveBeenCalledTimes(1)

    await element.updateComplete
    expect(getSignButton()?.disabled).toBe(true)

    pending.resolve()
    await flushPromises()
    await element.updateComplete
    expect(getSignButton()?.disabled).toBe(false)

    // After the request settles, signing can be started again
    signButton?.click()
    expect(SIWXUtil.requestSignMessage).toHaveBeenCalledTimes(2)
  })

  it('should not start another cancel while one is already in flight', async () => {
    const pending = deferred<void>()
    vi.spyOn(SIWXUtil, 'cancelSignMessage').mockReturnValue(pending.promise)

    const cancelButton = getCancelButton()
    expect(cancelButton).not.toBeNull()
    expect(cancelButton?.disabled).toBe(false)

    cancelButton?.click()
    cancelButton?.click()

    expect(SIWXUtil.cancelSignMessage).toHaveBeenCalledTimes(1)

    await element.updateComplete
    expect(getCancelButton()?.disabled).toBe(true)

    pending.resolve()
    await flushPromises()
    await element.updateComplete
    expect(getCancelButton()?.disabled).toBe(false)
  })
})
