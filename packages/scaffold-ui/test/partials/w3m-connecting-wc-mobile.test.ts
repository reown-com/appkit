import { fixture, html } from '@open-wc/testing'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ConnectionController, CoreHelperUtil, RouterController } from '@reown/appkit-controllers'

import { W3mConnectingWcMobile } from '../../src/partials/w3m-connecting-wc-mobile'

const WC_URI = 'uri'

describe('W3mConnectingWcMobile', () => {
  beforeAll(() => {
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
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
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
})
