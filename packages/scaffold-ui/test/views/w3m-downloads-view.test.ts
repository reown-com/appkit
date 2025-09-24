import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { CoreHelperUtil, EventsController, RouterController } from '@reown/appkit-controllers'

import { W3mDownloadsView } from '../../src/views/w3m-downloads-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const CHROME_STORE_BUTTON = 'wui-list-item'
const APP_STORE_BUTTON = 'wui-list-item'
const PLAY_STORE_BUTTON = 'wui-list-item'
const HOMEPAGE_BUTTON = 'wui-list-item'

const mockWallet = {
  id: 'metamask',
  name: 'MetaMask',
  order: 1,
  chrome_store: 'https://chrome.google.com/webstore/detail/metamask',
  app_store: 'https://apps.apple.com/app/metamask',
  play_store: 'https://play.google.com/store/apps/details?id=io.metamask',
  homepage: 'https://metamask.io'
}

const mockWalletPartial = {
  id: 'wallet2',
  name: 'Wallet 2',
  order: 2,
  chrome_store: null,
  app_store: null,
  play_store: 'https://play.google.com/store/apps/details?id=com.wallet2',
  homepage: 'https://wallet2.io'
}

describe('W3mDownloadsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with basic structure', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    expect(element).toBeDefined()
    expect(element.shadowRoot).toBeDefined()
  })

  it('should render all store options when wallet has all store links', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeButton = HelpersUtil.querySelectAll(element, CHROME_STORE_BUTTON)[0]
    const appStoreButton = HelpersUtil.querySelectAll(element, APP_STORE_BUTTON)[1]
    const playStoreButton = HelpersUtil.querySelectAll(element, PLAY_STORE_BUTTON)[2]
    const homepageButton = HelpersUtil.querySelectAll(element, HOMEPAGE_BUTTON)[3]

    expect(chromeButton).toBeTruthy()
    expect(appStoreButton).toBeTruthy()
    expect(playStoreButton).toBeTruthy()
    expect(homepageButton).toBeTruthy()

    expect(HelpersUtil.getTextContent(chromeButton!)).toContain('Chrome Extension')
    expect(HelpersUtil.getTextContent(appStoreButton!)).toContain('iOS App')
    expect(HelpersUtil.getTextContent(playStoreButton!)).toContain('Android App')
    expect(HelpersUtil.getTextContent(homepageButton!)).toContain('Website')
  })

  it('should only render available store options', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWalletPartial }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item')

    // Should only render Play Store and Homepage buttons
    expect(listItems.length).toBe(2)

    expect(HelpersUtil.getTextContent(listItems[0]!)).toContain('Android App')
    expect(HelpersUtil.getTextContent(listItems[1]!)).toContain('Website')
  })

  it('should not render Chrome Extension when chrome_store is null', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWalletPartial }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeButton = Array.from(HelpersUtil.querySelectAll(element, CHROME_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Chrome Extension')
    )

    expect(chromeButton).toBeUndefined()
  })

  it('should not render App Store when app_store is null', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWalletPartial }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const appStoreButton = Array.from(HelpersUtil.querySelectAll(element, APP_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('iOS App')
    )

    expect(appStoreButton).toBeUndefined()
  })

  it('should not render Play Store when play_store is null', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...mockWallet, play_store: null } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const playStoreButton = Array.from(HelpersUtil.querySelectAll(element, PLAY_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Android App')
    )

    expect(playStoreButton).toBeUndefined()
  })

  it('should not render Homepage when homepage is undefined', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...mockWallet, homepage: undefined } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const homepageButton = Array.from(HelpersUtil.querySelectAll(element, HOMEPAGE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Website')
    )

    expect(homepageButton).toBeUndefined()
  })

  it('should call openStore with correct params when Chrome store button is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeButton = Array.from(HelpersUtil.querySelectAll(element, CHROME_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Chrome Extension')
    )

    expect(chromeButton).toBeTruthy()
    chromeButton?.click()

    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'GET_WALLET',
      properties: {
        name: mockWallet.name,
        walletRank: mockWallet.order,
        explorerId: mockWallet.id,
        type: 'chrome_store'
      }
    })

    expect(openHrefSpy).toHaveBeenCalledWith(mockWallet.chrome_store, '_blank')
  })

  it('should call openStore with correct params when App store button is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const appStoreButton = Array.from(HelpersUtil.querySelectAll(element, APP_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('iOS App')
    )

    expect(appStoreButton).toBeTruthy()
    appStoreButton?.click()

    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'GET_WALLET',
      properties: {
        name: mockWallet.name,
        walletRank: mockWallet.order,
        explorerId: mockWallet.id,
        type: 'app_store'
      }
    })

    expect(openHrefSpy).toHaveBeenCalledWith(mockWallet.app_store, '_blank')
  })

  it('should call openStore with correct params when Play store button is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const playStoreButton = Array.from(HelpersUtil.querySelectAll(element, PLAY_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Android App')
    )

    expect(playStoreButton).toBeTruthy()
    playStoreButton?.click()

    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'GET_WALLET',
      properties: {
        name: mockWallet.name,
        walletRank: mockWallet.order,
        explorerId: mockWallet.id,
        type: 'play_store'
      }
    })

    expect(openHrefSpy).toHaveBeenCalledWith(mockWallet.play_store, '_blank')
  })

  it('should call openStore with correct params when Homepage button is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const homepageButton = Array.from(HelpersUtil.querySelectAll(element, HOMEPAGE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Website')
    )

    expect(homepageButton).toBeTruthy()
    homepageButton?.click()

    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'GET_WALLET',
      properties: {
        name: mockWallet.name,
        walletRank: mockWallet.order,
        explorerId: mockWallet.id,
        type: 'homepage'
      }
    })

    expect(openHrefSpy).toHaveBeenCalledWith(mockWallet.homepage, '_blank')
  })

  it('should not call openHref or sendEvent when href is empty', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: { ...mockWallet, chrome_store: '' } }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const chromeButton = Array.from(HelpersUtil.querySelectAll(element, CHROME_STORE_BUTTON)).find(
      button => HelpersUtil.getTextContent(button).includes('Chrome Extension')
    )

    // Button should not be rendered when chrome_store is empty
    expect(chromeButton).toBeUndefined()

    // Verify no calls were made
    expect(sendEventSpy).not.toHaveBeenCalled()
    expect(openHrefSpy).not.toHaveBeenCalled()
  })

  it('should not call openHref or sendEvent when wallet is undefined', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: undefined }
    })

    // This should throw an error as per the component logic
    await expect(fixture(html`<w3m-downloads-view></w3m-downloads-view>`)).rejects.toThrow(
      'w3m-downloads-view'
    )

    expect(sendEventSpy).not.toHaveBeenCalled()
    expect(openHrefSpy).not.toHaveBeenCalled()
  })

  it('should handle click events on all rendered buttons', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { wallet: mockWallet }
    })

    const element: W3mDownloadsView = await fixture(html`<w3m-downloads-view></w3m-downloads-view>`)

    const buttons = HelpersUtil.querySelectAll(element, 'wui-list-item')
    expect(buttons.length).toBe(4) // Chrome, App Store, Play Store, Homepage

    // Click all buttons and verify they work
    buttons.forEach((button, index) => {
      button.click()

      const expectedTypes = ['chrome_store', 'app_store', 'play_store', 'homepage']
      expect(sendEventSpy).toHaveBeenNthCalledWith(index + 1, {
        type: 'track',
        event: 'GET_WALLET',
        properties: {
          name: mockWallet.name,
          walletRank: mockWallet.order,
          explorerId: mockWallet.id,
          type: expectedTypes[index]
        }
      })
    })

    expect(sendEventSpy).toHaveBeenCalledTimes(4)
    expect(openHrefSpy).toHaveBeenCalledTimes(4)
  })
})
