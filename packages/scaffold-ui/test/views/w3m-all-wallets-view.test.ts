import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { CoreHelperUtil, RouterController, SnackController } from '@reown/appkit-controllers'

import { W3mAllWalletsView } from '../../src/views/w3m-all-wallets-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const CERTIFIED_SWITCH_TEST_ID = 'wui-certified-switch'
const SEARCH_BAR_SELECTOR = 'wui-search-bar'
const ALL_WALLETS_LIST_SELECTOR = 'w3m-all-wallets-list'
const ALL_WALLETS_SEARCH_SELECTOR = 'w3m-all-wallets-search'
const QR_BUTTON_SELECTOR = 'wui-icon-box'

beforeAll(() => {
  ;(globalThis as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  if (!(HTMLElement.prototype as any).animate) {
    ;(HTMLElement.prototype as any).animate = vi.fn().mockReturnValue({
      finished: Promise.resolve(),
      cancel: vi.fn()
    })
  }
})

describe('W3mAllWalletsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(CoreHelperUtil, 'debounce').mockImplementation(fn => fn)
  })

  it('should render', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render search bar and certified switch', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    const searchBar = HelpersUtil.querySelect(element, SEARCH_BAR_SELECTOR)
    const certifiedSwitch = HelpersUtil.getByTestId(element, CERTIFIED_SWITCH_TEST_ID)

    expect(searchBar).toBeTruthy()
    expect(certifiedSwitch).toBeTruthy()
  })

  it('should render all wallets list by default', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    const list = HelpersUtil.querySelect(element, ALL_WALLETS_LIST_SELECTOR)
    const search = HelpersUtil.querySelect(element, ALL_WALLETS_SEARCH_SELECTOR)

    expect(list).toBeTruthy()
    expect(search).toBeNull()
  })

  it('should render search component when search length is >= 2', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['onInputChange']({ detail: 'ab' } as CustomEvent<string>)
    await element.updateComplete

    const list = HelpersUtil.querySelect(element, ALL_WALLETS_LIST_SELECTOR)
    const search = HelpersUtil.querySelect(element, ALL_WALLETS_SEARCH_SELECTOR)

    expect(list).toBeNull()
    expect(search).toBeTruthy()
  })

  it('should render search component when badge is set', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['badge'] = 'certified'
    await element.updateComplete

    const list = HelpersUtil.querySelect(element, ALL_WALLETS_LIST_SELECTOR)
    const search = HelpersUtil.querySelect(element, ALL_WALLETS_SEARCH_SELECTOR)

    expect(list).toBeNull()
    expect(search).toBeTruthy()
  })

  it('should update search state on input change', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['onInputChange']({ detail: 'test search' } as CustomEvent<string>)
    await element.updateComplete

    expect(element['search']).toBe('test search')
  })

  it('should set badge to certified when certified switch is enabled', async () => {
    const snackSpy = vi.spyOn(SnackController, 'showSvg').mockImplementation(() => {})

    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['onCertifiedSwitchChange']({ detail: true } as CustomEvent<boolean>)
    await element.updateComplete

    expect(element['badge']).toBe('certified')
    expect(snackSpy).toHaveBeenCalledWith('Only WalletConnect certified', {
      icon: 'walletConnectBrown',
      iconColor: 'accent-100'
    })
  })

  it('should clear badge when certified switch is disabled', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['badge'] = 'certified'
    await element.updateComplete

    element['onCertifiedSwitchChange']({ detail: false } as CustomEvent<boolean>)
    await element.updateComplete

    expect(element['badge']).toBeUndefined()
  })

  it('should not show QR button on desktop', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    const qrButton = HelpersUtil.querySelect(element, QR_BUTTON_SELECTOR)
    expect(qrButton).toBeNull()
  })

  it('should show QR button on mobile', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    const qrButton = HelpersUtil.querySelect(element, QR_BUTTON_SELECTOR)
    expect(qrButton).toBeTruthy()
  })

  it('should navigate to ConnectingWalletConnect when QR button is clicked', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())

    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    const qrButton = HelpersUtil.querySelect(element, QR_BUTTON_SELECTOR)
    qrButton?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect')
  })

  it('should use debounced search function', async () => {
    const debounceSpy = vi.spyOn(CoreHelperUtil, 'debounce').mockImplementation(vi.fn())

    await fixture(html`<w3m-all-wallets-view></w3m-all-wallets-view>`)

    expect(debounceSpy).toHaveBeenCalled()
  })

  it('should render search component when both search and badge are active', async () => {
    const element: W3mAllWalletsView = await fixture(
      html`<w3m-all-wallets-view></w3m-all-wallets-view>`
    )

    element['search'] = 'test'
    element['badge'] = 'certified'
    await element.updateComplete

    const list = HelpersUtil.querySelect(element, ALL_WALLETS_LIST_SELECTOR)
    const search = HelpersUtil.querySelect(element, ALL_WALLETS_SEARCH_SELECTOR)

    expect(list).toBeNull()
    expect(search).toBeTruthy()
  })
})
