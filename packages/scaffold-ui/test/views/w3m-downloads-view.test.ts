import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { CoreHelperUtil, RouterController } from '@reown/appkit-controllers'

import { W3mDownloadsView } from '../../src/views/w3m-downloads-view/index'

// -- Constants -------------------------------------------- //
const LIST_ITEM_SELECTOR = 'wui-list-item'
const TEXT_SELECTOR = 'wui-text'

const MOCK_WALLET = {
  id: 'test-wallet',
  name: 'Test Wallet',
  chrome_store: 'https://chrome.google.com/test',
  app_store: 'https://apps.apple.com/test',
  play_store: 'https://play.google.com/test',
  homepage: 'https://testwallet.com'
}

describe('W3mDownloadsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: MOCK_WALLET }
    })
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())
  })

  it('should render', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)
    expect(element).toBeTruthy()
  })

  it('should render all download options when wallet has all stores', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const listItems = element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR)
    expect(listItems).toHaveLength(4)
  })

  it('should render chrome extension option when chrome_store is available', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Chrome Extension'))

    expect(chromeItem).toBeTruthy()
  })

  it('should not render chrome extension option when chrome_store is not available', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...MOCK_WALLET, chrome_store: undefined } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Chrome Extension'))

    expect(chromeItem).toBeUndefined()
  })

  it('should render iOS app option when app_store is available', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const iosItem = Array.from(element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []).find(
      item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('iOS App')
    )

    expect(iosItem).toBeTruthy()
  })

  it('should not render iOS app option when app_store is not available', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...MOCK_WALLET, app_store: undefined } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const iosItem = Array.from(element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []).find(
      item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('iOS App')
    )

    expect(iosItem).toBeUndefined()
  })

  it('should render android app option when play_store is available', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const androidItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Android App'))

    expect(androidItem).toBeTruthy()
  })

  it('should not render android app option when play_store is not available', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...MOCK_WALLET, play_store: undefined } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const androidItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Android App'))

    expect(androidItem).toBeUndefined()
  })

  it('should render website option when homepage is available', async () => {
    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const websiteItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Website'))

    expect(websiteItem).toBeTruthy()
  })

  it('should not render website option when homepage is not available', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...MOCK_WALLET, homepage: undefined } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const websiteItem = Array.from(
      element.shadowRoot?.querySelectorAll(LIST_ITEM_SELECTOR) || []
    ).find(item => item.querySelector(TEXT_SELECTOR)?.textContent?.includes('Website'))

    expect(websiteItem).toBeUndefined()
  })
})
