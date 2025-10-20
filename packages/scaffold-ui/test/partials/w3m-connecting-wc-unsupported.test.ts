import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { AssetUtil, EventsController, RouterController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-connecting-wc-unsupported/index'
import { HelpersUtil } from '../utils/HelpersUtil'

const WALLET = {
  id: 'wallet-id',
  name: 'Test Wallet',
  image_url: 'test.png',
  display_index: 3
}

describe('W3mConnectingWcUnsupported', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: WALLET }
    })
    vi.spyOn(AssetUtil, 'getWalletImage').mockReturnValue('image.png')
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})
  })

  it('should render wallet image, text, and download links', async () => {
    const element = await fixture(
      html`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`
    )

    const walletImage = HelpersUtil.querySelect(element, 'wui-wallet-image')
    const notDetected = element.shadowRoot?.textContent?.includes('Not Detected')
    const downloadLinks = HelpersUtil.querySelect(element, 'w3m-mobile-download-links') as {
      wallet?: unknown
    }

    expect(walletImage).toBeTruthy()
    expect(notDetected).toBe(true)
    expect(downloadLinks).toBeTruthy()
    expect(downloadLinks.wallet).toBe(WALLET)
    expect(AssetUtil.getWalletImage).toHaveBeenCalledWith(WALLET)
  })

  it('should track SELECT_WALLET with proper properties on construct', async () => {
    ;(await fixture(
      html`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`
    )) as HTMLElement

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: WALLET.name,
        platform: 'browser',
        displayIndex: WALLET.display_index
      }
    })
  })

  it('should throw if no wallet provided via RouterController.state', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: undefined
    })

    const { W3mConnectingWcUnsupported } = await import(
      '../../src/partials/w3m-connecting-wc-unsupported/index'
    )

    expect(() => new W3mConnectingWcUnsupported()).toThrow(
      'w3m-connecting-wc-unsupported: No wallet provided'
    )
  })
})
