import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'

import { W3mConnectingWcMobile } from '../../src/partials/w3m-connecting-wc-mobile'

const WC_URI = 'uri'

describe('W3mConnectingWcMobile', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'openHref')
    vi.spyOn(CoreHelperUtil, 'isIframe').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          id: 'test',
          name: 'test',
          mobile_link: 'link'
        }
      }
    })
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: WC_URI
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  it('should call openHref with _self if not in an iframe', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    const el: W3mConnectingWcMobile = await fixture(
      html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
    )
    el['onConnect']()

    expect(openHrefSpy).toHaveBeenCalledWith(`link://wc?uri=${WC_URI}`, '_self')
  })
  it('should call openHref with _top if inside iframe', async () => {
    const originalTop = global.window.top
    const originalSelf = global.window.self
    try {
      ;(global.window as any).top = { name: 'top' }
      ;(global.window as any).self = { name: 'self' }

      vi.spyOn(CoreHelperUtil, 'isIframe').mockReturnValue(true)

      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
      const el: W3mConnectingWcMobile = await fixture(
        html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
      )
      el['onConnect']()

      expect(openHrefSpy).toHaveBeenCalledWith(`link://wc?uri=${WC_URI}`, '_top')
    } finally {
      global.window.top = originalTop
      global.window.self = originalSelf
    }
  })

  it('should reset labels and timeouts on Try Again', async () => {
    vi.useFakeTimers()
    const el: W3mConnectingWcMobile = await fixture(
      html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
    )

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
    const setWcErrorSpy = vi.spyOn(ConnectionController, 'setWcError')
    const onConnectSpy = vi.spyOn(el as any, 'onConnect')

    el['secondaryBtnLabel'] = 'Try again'
    el['secondaryLabel'] = `Hold tight... it's taking longer than expected`

    // Clear mocks before calling the method to isolate calls within onTryAgain
    clearTimeoutSpy.mockClear()
    setTimeoutSpy.mockClear()

    el['onTryAgain']()

    // Check core logic: labels reset, new timeouts set, error cleared, connect called
    expect(el['secondaryBtnLabel']).toBeUndefined()
    expect(el['secondaryLabel']).toBe(ConstantsUtil.CONNECT_LABELS.MOBILE)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
    expect(setWcErrorSpy).toHaveBeenCalledWith(false)
    expect(onConnectSpy).toHaveBeenCalledOnce()

    // Check that the original timeouts were cleared at least once during the process
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
