import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-controllers'

// -- Constants ------------------------------------------- //
const WC_URI = 'xyz'
const WALLET = {
  name: 'Fireblocks',
  desktop_link: 'https://fireblocks.com/'
} as WcWallet
const REDIRECT_URL = `${WALLET.desktop_link}wc?uri=${encodeURIComponent(WC_URI)}`

describe('W3mConnectingWcDesktop', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
    vi.spyOn(ConnectionController, 'setWcLinking')
    vi.spyOn(ConnectionController, 'setRecentWallet')
    vi.spyOn(CoreHelperUtil, 'openHref')
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should handle redirection if the wallet desktop link exists', async () => {
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: WC_URI
    })
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: WALLET
      }
    })

    await fixture(html`<w3m-connecting-wc-desktop></w3m-connecting-wc-desktop>`)

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'desktop' }
    })
    expect(ConnectionController.setWcLinking).toHaveBeenCalledWith({
      name: WALLET.name,
      href: WALLET.desktop_link
    })
    expect(ConnectionController.setRecentWallet).toHaveBeenCalledWith(WALLET)
    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(REDIRECT_URL, '_blank')
  })

  it('it should not perform redirection if no desktop link is found', async () => {
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: WC_URI
    })
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          desktop_link: null
        }
      }
    })

    await fixture(html`<w3m-connecting-wc-desktop></w3m-connecting-wc-desktop>`)

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'desktop' }
    })
    expect(ConnectionController.setWcLinking).not.toHaveBeenCalled()
    expect(ConnectionController.setRecentWallet).not.toHaveBeenCalled()
    expect(CoreHelperUtil.openHref).not.toHaveBeenCalled()
  })
})
