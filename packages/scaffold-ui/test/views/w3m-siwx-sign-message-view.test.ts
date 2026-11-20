import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { RouterController, SIWXUtil, SnackController } from '@reown/appkit-controllers'

import { W3mSIWXSignMessageView } from '../../src/views/w3m-siwx-sign-message-view/index'

async function flushMicrotasks() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('W3mSIWXSignMessageView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({}) as Animation)
    })
  })

  it('should request signature automatically when mounted', async () => {
    const requestSignMessageSpy = vi
      .spyOn(SIWXUtil, 'requestSignMessage')
      .mockResolvedValue(undefined)

    await fixture<W3mSIWXSignMessageView>(
      html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`
    )
    await flushMicrotasks()

    expect(requestSignMessageSpy).toHaveBeenCalledTimes(1)
  })

  it('should not request signature twice while signing is already in progress', async () => {
    let resolveRequest!: () => void
    const pendingRequest = new Promise<void>(resolve => {
      resolveRequest = resolve
    })
    const requestSignMessageSpy = vi
      .spyOn(SIWXUtil, 'requestSignMessage')
      .mockReturnValue(pendingRequest)

    const element = await fixture<W3mSIWXSignMessageView>(
      html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`
    )
    await flushMicrotasks()

    await (element as any).onSign()

    resolveRequest()
    await flushMicrotasks()

    expect(requestSignMessageSpy).toHaveBeenCalledTimes(1)
  })

  it('should route to DataCapture when OTP is required', async () => {
    vi.spyOn(SIWXUtil, 'requestSignMessage').mockRejectedValue(new Error('OTP is required'))
    const showErrorSpy = vi.spyOn(SnackController, 'showError').mockImplementation(() => {})
    const routerReplaceSpy = vi.spyOn(RouterController, 'replace').mockImplementation(() => {})

    await fixture<W3mSIWXSignMessageView>(
      html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`
    )
    await flushMicrotasks()

    expect(showErrorSpy).toHaveBeenCalledWith({
      message: 'Something went wrong. We need to verify your account again.'
    })
    expect(routerReplaceSpy).toHaveBeenCalledWith('DataCapture')
  })
})
