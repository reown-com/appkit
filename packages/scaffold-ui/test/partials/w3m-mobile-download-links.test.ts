import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { CoreHelperUtil, RouterController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-mobile-download-links/index'
import { HelpersUtil } from '../utils/HelpersUtil'

const WALLET = {
  name: 'Example Wallet',
  app_store: 'https://appstore.example/app',
  play_store: 'https://play.example/app',
  chrome_store: 'https://chrome.example/app',
  homepage: 'https://example.com'
}

describe('W3mMobileDownloadLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(false)
    vi.spyOn(CoreHelperUtil, 'isAndroid').mockReturnValue(false)
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
  })

  it('should hide when no wallet provided', async () => {
    const el = (await fixture(
      html`<w3m-mobile-download-links></w3m-mobile-download-links>`
    )) as HTMLElement
    expect(el.style.display).toBe('none')
  })

  it('should show single homepage button and opens homepage', async () => {
    const el = await fixture(
      html`<w3m-mobile-download-links
        .wallet=${{ name: WALLET.name, homepage: WALLET.homepage }}
      />`
    )
    const btn = HelpersUtil.querySelect(el, 'wui-cta-button')
    expect(btn).toBeTruthy()

    btn.click()
    await elementUpdated(el)

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(WALLET.homepage, '_blank')
  })

  it('should show cta button and route to downloads', async () => {
    const el = await fixture(html`<w3m-mobile-download-links .wallet=${WALLET} />`)
    const btn = HelpersUtil.querySelect(el, 'wui-cta-button')
    expect(btn).toBeTruthy()

    btn.click()
    await elementUpdated(el)

    expect(RouterController.push).toHaveBeenCalledWith('Downloads', { wallet: WALLET })
  })

  it('should show App Store button on iOS', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true)
    const el = await fixture(
      html`<w3m-mobile-download-links
        .wallet=${{ name: WALLET.name, app_store: WALLET.app_store }}
      />`
    )
    const btn = HelpersUtil.querySelect(el, 'wui-cta-button')

    btn.click()
    await elementUpdated(el)

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(WALLET.app_store, '_blank')
  })

  it('should show Play Store button on Android', async () => {
    vi.spyOn(CoreHelperUtil, 'isAndroid').mockReturnValue(true)
    const el = await fixture(
      html`<w3m-mobile-download-links
        .wallet=${{ name: WALLET.name, play_store: WALLET.play_store }}
      />`
    )
    const btn = HelpersUtil.querySelect(el, 'wui-cta-button')

    btn.click()
    await elementUpdated(el)

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(WALLET.play_store, '_blank')
  })
})
