import { W3mBuyInProgressView } from '../../src/views/w3m-buy-in-progress-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AccountController,
  BlockchainApiController,
  CoreHelperUtil,
  OnRampController,
  OptionsController,
  RouterController,
  SnackController,
  ThemeController,
  type AccountControllerState,
  type OnRampControllerState,
  type ThemeControllerState
} from '@reown/appkit-core'
import type { Transaction } from '@reown/appkit-common'
import type {
  OptionsControllerStateInternal,
  OptionsControllerStatePublic
} from '../../../core/dist/types/src/controllers/OptionsController'

describe('W3mBuyInProgressView', () => {
  const mockProvider = {
    name: 'coinbase',
    label: 'Coinbase',
    url: 'https://coinbase.com'
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      selectedProvider: mockProvider
    } as OnRampControllerState)

    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123'
    } as AccountControllerState)

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      projectId: 'test-project'
    } as unknown as OptionsControllerStatePublic & OptionsControllerStateInternal)

    vi.spyOn(ThemeController, 'state', 'get').mockReturnValue({
      themeVariables: { '--w3m-border-radius-master': '4px' }
    } as unknown as ThemeControllerState)

    vi.spyOn(window, 'open').mockReturnValue({} as Window)

    vi.spyOn(SnackController, 'showSuccess').mockResolvedValue()
    vi.spyOn(SnackController, 'showError').mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders initial state correctly', async () => {
    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    const loadingThumbnail = HelpersUtil.querySelect(element, 'wui-loading-thumbnail')
    expect(loadingThumbnail).toBeTruthy()

    const visual = HelpersUtil.querySelect(element, 'wui-visual')
    expect(visual).toBeTruthy()

    const label = HelpersUtil.querySelect(element, '[data-testid="w3m-buy-in-progress-label"]')
    expect(HelpersUtil.getTextContent(label)).toContain('Buy in Coinbase')
  })

  it('watches Coinbase transactions and navigates on success', async () => {
    vi.spyOn(BlockchainApiController, 'fetchTransactions').mockResolvedValue({
      data: [
        {
          metadata: {
            minedAt: new Date().toString(),
            status: 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS' as const
          }
        } as Transaction
      ],
      next: null
    })
    const routerSpy = vi.spyOn(RouterController, 'replace')

    await fixture(html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`)
    await vi.runOnlyPendingTimersAsync()

    expect(routerSpy).toHaveBeenCalledWith('OnRampActivity')
  })

  it('shows error state after timeout', async () => {
    vi.spyOn(BlockchainApiController, 'fetchTransactions').mockResolvedValue({
      data: [],
      next: null
    })

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    vi.advanceTimersByTime(180_000)
    await vi.runOnlyPendingTimersAsync()

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.querySelect(element, 'wui-button')).toBeTruthy()

    const label = HelpersUtil.querySelect(element, '[data-testid="w3m-buy-in-progress-label"]')
    expect(HelpersUtil.getTextContent(label)).toContain('Buy failed')
  })

  it('copies provider URL', async () => {
    const copyToClipboardSpy = vi.spyOn(CoreHelperUtil, 'copyToClipboard')

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )
    const copyLink = HelpersUtil.querySelect(element, 'wui-link')
    copyLink?.click()

    expect(copyToClipboardSpy).toHaveBeenCalledWith(mockProvider.url)
  })

  it('handles copy error when no provider URL', async () => {
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      selectedProvider: { ...mockProvider, url: undefined }
    } as unknown as OnRampControllerState)

    const showErrorSpy = vi.spyOn(SnackController, 'showError')
    const routerSpy = vi.spyOn(RouterController, 'goBack')

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )
    const copyLink = HelpersUtil.querySelect(element, 'wui-link')
    copyLink?.click()

    expect(showErrorSpy).toHaveBeenCalledWith('No link found')
    expect(routerSpy).toHaveBeenCalled()
  })

  it('retries buy process', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

    const element: W3mBuyInProgressView = await fixture(
      html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
    )

    vi.advanceTimersByTime(180_000)
    await vi.runOnlyPendingTimersAsync()
    element.requestUpdate()
    await elementUpdated(element)

    const retryButton = HelpersUtil.querySelect(element, 'wui-button')
    retryButton?.click()

    expect(openHrefSpy).toHaveBeenCalledWith(
      mockProvider.url,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
  })
})
