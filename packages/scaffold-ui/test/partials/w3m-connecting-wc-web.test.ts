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
  name: 'React Wallet',
  webapp_link: 'https://react-wallet.walletconnect.com/'
} as WcWallet
const REDIRECT_URL = `${WALLET.webapp_link}wc?uri=${encodeURIComponent(WC_URI)}`

describe('W3mConnectingWcWeb', () => {
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

  it('it should handle redirection if the wallet webapp link exists and URI is available', async () => {
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

    const element = await fixture(html`<w3m-connecting-wc-web></w3m-connecting-wc-web>`)

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'web' }
    })

    // Test the "Open" button is not disabled
    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.hasAttribute('disabled')).toBe(false)

    // Simulate clicking the button
    button?.click()

    expect(ConnectionController.setWcLinking).toHaveBeenCalledWith({
      name: WALLET.name,
      href: WALLET.webapp_link
    })
    expect(ConnectionController.setRecentWallet).toHaveBeenCalledWith(WALLET)
    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(REDIRECT_URL, '_blank')
  })

  it('it should disable the button if no URI is available', async () => {
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: undefined
    })
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: WALLET
      }
    })

    const element = await fixture(html`<w3m-connecting-wc-web></w3m-connecting-wc-web>`)

    // Verify the button is disabled
    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.hasAttribute('disabled')).toBe(true)

    // Simulate clicking the button
    button?.click()

    // Verify no actions are performed
    expect(CoreHelperUtil.openHref).not.toHaveBeenCalled()
  })
})
