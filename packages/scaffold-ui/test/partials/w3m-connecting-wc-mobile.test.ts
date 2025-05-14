import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConnectionController, CoreHelperUtil, RouterController } from '@reown/appkit-controllers'

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

  it('should reset error values on try again', async () => {
    vi.useFakeTimers()
    const el: W3mConnectingWcMobile = await fixture(
      html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
    )
    const setWcErrorSpy = vi.spyOn(ConnectionController, 'setWcError')

    el['onTryAgain']()

    expect(setWcErrorSpy).toHaveBeenCalledWith(false)
  })

  it('should use link_mode when enableUniversalLinks is true and wallet has link_mode', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValueOnce({
      ...RouterController.state,
      data: {
        wallet: {
          id: 'test',
          name: 'test',
          mobile_link: 'link',
          link_mode: 'reown.com/appkit'
        }
      }
    })

    const el: W3mConnectingWcMobile = await fixture(
      html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
    )

    // Mock enableUniversalLinks to true
    el['preferUniversalLinks'] = true

    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    el['onConnect']()

    expect(openHrefSpy).toHaveBeenCalledWith(
      expect.stringContaining('reown.com/appkit/wc?uri='),
      '_self'
    )
  })

  it('should use deeplink if enableUniversalLinks is enabled but wallet has no link_mode', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValueOnce({
      ...RouterController.state,
      data: {
        wallet: {
          id: 'test',
          name: 'test',
          mobile_link: 'test://app'
        }
      }
    })

    const el: W3mConnectingWcMobile = await fixture(
      html`<w3m-connecting-wc-mobile></w3m-connecting-wc-mobile>`
    )

    // Mock enableUniversalLinks to true
    el['preferUniversalLinks'] = true

    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    el['onConnect']()

    expect(openHrefSpy).toHaveBeenCalledWith(expect.stringContaining('test://app/wc?uri='), '_self')
  })
})
