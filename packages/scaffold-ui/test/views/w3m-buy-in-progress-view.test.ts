import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ConnectionController,
  CoreHelperUtil,
  OnRampController,
  RouterController,
  SnackController,
  ThemeController
} from '@reown/appkit-controllers'

import { W3mBuyInProgressView } from '../../src/views/w3m-buy-in-progress-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const COPY_LINK_SELECTOR = 'wui-link'
const TRY_AGAIN_BUTTON_SELECTOR = 'wui-button'
const PROVIDER_VISUAL_SELECTOR = 'wui-visual'
const LOADING_THUMBNAIL_SELECTOR = 'wui-loading-thumbnail'

describe('W3mBuyInProgressView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(OnRampController, 'subscribeKey').mockImplementation(vi.fn())
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: 'wc:test-uri'
    })
    vi.spyOn(OnRampController.state, 'selectedProvider', 'get').mockReturnValue({
      name: 'meld',
      label: 'Test Provider',
      url: 'https://test-provider.com',
      feeRange: '1-3%',
      supportedChains: ['ethereum', 'polygon']
    })
    vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValue({
      '--w3m-border-radius-master': '4px'
    })
  })

  it('should render', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render with default state', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    const providerVisual = HelpersUtil.querySelect(element, PROVIDER_VISUAL_SELECTOR)
    const loadingThumbnail = HelpersUtil.querySelect(element, LOADING_THUMBNAIL_SELECTOR)
    const copyLink = HelpersUtil.querySelect(element, COPY_LINK_SELECTOR)

    expect(providerVisual).toBeTruthy()
    expect(loadingThumbnail).toBeTruthy()
    expect(copyLink).toBeTruthy()
  })

  it('should render with provider label when provider is selected', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    const textElements = element.shadowRoot?.querySelectorAll('wui-text')
    const labelText = Array.from(textElements || []).find(el =>
      el.textContent?.includes('Buy in Test Provider')
    )

    expect(labelText).toBeTruthy()
  })

  it('should render error state when error is true', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['error'] = true
    await element.updateComplete

    const tryAgainButton = HelpersUtil.querySelect(element, TRY_AGAIN_BUTTON_SELECTOR)
    const loadingThumbnail = HelpersUtil.querySelect(element, LOADING_THUMBNAIL_SELECTOR)

    expect(tryAgainButton).toBeTruthy()
    expect(loadingThumbnail).toBeNull()
  })

  it('should show error label when error is true', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['error'] = true
    await element.updateComplete

    const textElements = element.shadowRoot?.querySelectorAll('wui-text')
    const errorLabel = Array.from(textElements || []).find(el =>
      el.textContent?.includes('Buy failed')
    )

    expect(errorLabel).toBeTruthy()
  })

  it('should show default label when no provider is selected', async () => {
    vi.spyOn(OnRampController.state, 'selectedProvider', 'get').mockReturnValue(null)

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    const textElements = element.shadowRoot?.querySelectorAll('wui-text')
    const defaultLabel = Array.from(textElements || []).find(el =>
      el.textContent?.includes('Continue in external window')
    )

    expect(defaultLabel).toBeTruthy()
  })

  it('should open provider URL when try again is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['error'] = true
    await element.updateComplete

    element['onTryAgain']()

    expect(openHrefSpy).toHaveBeenCalledWith(
      'https://test-provider.com',
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
  })

  it('should not open URL when try again is clicked without provider', async () => {
    vi.spyOn(OnRampController.state, 'selectedProvider', 'get').mockReturnValue(null)
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['onTryAgain']()

    expect(openHrefSpy).not.toHaveBeenCalled()
  })

  it('should reset error state when try again is clicked', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['error'] = true
    await element.updateComplete

    element['onTryAgain']()
    await element.updateComplete

    expect(element['error']).toBe(false)
  })

  it('should copy provider URL when copy link is clicked', async () => {
    const copySpy = vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(vi.fn())
    const successSpy = vi.spyOn(SnackController, 'showSuccess').mockImplementation(vi.fn())

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['onCopyUri']()

    expect(copySpy).toHaveBeenCalledWith('https://test-provider.com')
    expect(successSpy).toHaveBeenCalledWith('Link copied')
  })

  it('should show error when copy fails', async () => {
    const copySpy = vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(() => {
      throw new Error('Copy failed')
    })
    const errorSpy = vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['onCopyUri']()

    expect(copySpy).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith('Failed to copy')
  })

  it('should show error and go back when no provider URL exists', async () => {
    vi.spyOn(OnRampController.state, 'selectedProvider', 'get').mockReturnValue({
      name: 'meld',
      label: 'Test Provider',
      url: '',
      feeRange: '1-3%',
      supportedChains: ['ethereum', 'polygon']
    })
    const errorSpy = vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())
    const goBackSpy = vi.spyOn(RouterController, 'goBack').mockImplementation(vi.fn())

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['onCopyUri']()

    expect(errorSpy).toHaveBeenCalledWith('No link found')
    expect(goBackSpy).toHaveBeenCalled()
  })

  it('should not render try again button when provider has no URL', async () => {
    vi.spyOn(OnRampController.state, 'selectedProvider', 'get').mockReturnValue({
      name: 'meld',
      label: 'Test Provider',
      url: '',
      feeRange: '1-3%',
      supportedChains: ['ethereum', 'polygon']
    })

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    element['error'] = true
    await element.updateComplete

    const tryAgainButton = HelpersUtil.querySelect(element, TRY_AGAIN_BUTTON_SELECTOR)
    expect(tryAgainButton).toBeNull()
  })

  it('should subscribe to OnRampController state changes', async () => {
    const subscribeSpy = vi.spyOn(OnRampController, 'subscribeKey').mockImplementation(vi.fn())

    await fixture(html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('selectedProvider', expect.any(Function))
  })
})
