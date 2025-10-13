import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  ChainController,
  ConnectionController,
  ModalController,
  SnackController
} from '@reown/appkit-controllers'

import { PayController } from '../../src/controllers/PayController'
import { W3mPayView } from '../../src/ui/w3m-pay-view'
import { isPayWithWalletSupported } from '../../src/utils/AssetUtil.js'
import {
  mockConnectionState,
  mockExchanges,
  mockPaymentAsset,
  mockRequestedCaipNetworks
} from '../mocks/State'

vi.mock('../../src/utils/AssetUtil.js', () => ({
  isPayWithWalletSupported: vi.fn()
}))

describe('W3mPayView', () => {
  beforeAll(() => {
    if (!customElements.get('w3m-pay-view')) {
      customElements.define('w3m-pay-view', W3mPayView)
    }
  })

  beforeEach(() => {
    // Reset PayController state
    PayController.state.isLoading = false
    PayController.state.exchanges = []
    PayController.state.paymentAsset = mockPaymentAsset
    PayController.state.amount = 10
    PayController.state.recipient = '0x1234567890123456789012345678901234567890'

    // Reset Account state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      status: 'disconnected',
      caipAddress: undefined,
      connectedWalletInfo: undefined,
      currentTab: 0,
      addressLabels: new Map()
    })

    // Mock ChainController
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(
      mockRequestedCaipNetworks
    )

    // Mock PayController methods
    vi.spyOn(PayController, 'fetchExchanges').mockImplementation(async () => {
      PayController.state.exchanges = mockExchanges
    })
    vi.spyOn(PayController, 'handlePayWithWallet').mockImplementation(() => {})
    vi.spyOn(PayController, 'handlePayWithExchange').mockImplementation(async () => null)

    // Mock ConnectionController and ModalController
    vi.spyOn(ConnectionController, 'disconnect').mockImplementation(async () => {})
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

    vi.mocked(isPayWithWalletSupported).mockReturnValue(true)
  })

  test('should render payment header with correct amount and token', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const amountText = element.shadowRoot?.querySelector('wui-text[variant="h1-regular"]')
    const tokenText = element.shadowRoot?.querySelector('wui-text[variant="md-medium"]')
    const networkText = element.shadowRoot?.querySelector('wui-text[variant="sm-medium"]')

    expect(amountText?.textContent).toBe('10')
    expect(tokenText?.textContent?.trim()).toBe('USDC')
    expect(networkText?.textContent?.trim()).toBe('on Ethereum')
  })

  test('should render disconnected wallet view when not connected', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const disconnectedView = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    )
    expect(disconnectedView).not.toBeNull()
    expect(disconnectedView?.querySelector('wui-text')?.textContent).toBe('Pay from wallet')
  })

  test('should render connected wallet view when connected', async () => {
    // Mock connected state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      ...(mockConnectionState as any)
    } as unknown as AccountState)

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const connectedView = element.shadowRoot?.querySelector('[data-testid="wallet-payment-option"]')
    const disconnectButton = element.shadowRoot?.querySelector('[data-testid="disconnect-button"]')

    expect(connectedView).not.toBeNull()
    expect(connectedView?.querySelector('wui-text')?.textContent).toBe('Pay with MetaMask')
    expect(disconnectButton).not.toBeNull()
  })

  test('should render loading state when exchanges are loading', async () => {
    // Set loading state
    PayController.state.isLoading = true

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const spinner = element.shadowRoot?.querySelector('wui-spinner')
    expect(spinner).not.toBeNull()
  })

  test('should render exchanges when available', async () => {
    PayController.state.exchanges = mockExchanges

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const coinbaseOption = element.shadowRoot?.querySelector(
      '[data-testid="exchange-option-coinbase"]'
    )
    const binanceOption = element.shadowRoot?.querySelector(
      '[data-testid="exchange-option-binance"]'
    )

    expect(coinbaseOption).not.toBeNull()
    expect(binanceOption).not.toBeNull()
    expect(
      coinbaseOption?.querySelector('wui-text')?.textContent?.includes('Pay with Coinbase')
    ).toBe(true)
    expect(
      binanceOption?.querySelector('wui-text')?.textContent?.includes('Pay with Binance')
    ).toBe(true)
  })

  test('should call handlePayWithWallet when wallet payment option is clicked', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const walletPaymentOption = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    )
    await walletPaymentOption?.dispatchEvent(new Event('click'))

    expect(PayController.handlePayWithWallet).toHaveBeenCalledOnce()
  })

  test('should call handlePayWithExchange when an exchange option is clicked', async () => {
    // Populate exchanges
    PayController.state.exchanges = mockExchanges

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const coinbaseOption = element.shadowRoot?.querySelector(
      '[data-testid="exchange-option-coinbase"]'
    )
    await coinbaseOption?.dispatchEvent(new Event('click'))

    expect(PayController.handlePayWithExchange).toHaveBeenCalledWith('coinbase')
  })

  test('should disconnect wallet when disconnect button is clicked', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      ...(mockConnectionState as any)
    } as unknown as AccountState)

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const disconnectButton = element.shadowRoot?.querySelector('[data-testid="disconnect-button"]')
    await disconnectButton?.dispatchEvent(new Event('click'))

    expect(ConnectionController.disconnect).toHaveBeenCalledOnce()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  test('should show error snackbar if disconnection fails', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      ...(mockConnectionState as any)
    } as unknown as AccountState)

    vi.spyOn(ConnectionController, 'disconnect').mockRejectedValueOnce(
      new Error('Disconnect failed')
    )

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const disconnectButton = element.shadowRoot?.querySelector('[data-testid="disconnect-button"]')
    await disconnectButton?.dispatchEvent(new Event('click'))

    await elementUpdated(element)

    expect(SnackController.showError).toHaveBeenCalledWith('Failed to disconnect')
  })

  test('should show "no exchanges available" when exchanges array is empty', async () => {
    PayController.state.exchanges = []
    PayController.state.isLoading = false

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const noExchangesText = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || []).find(
      el => el.textContent?.includes('No exchanges available')
    )

    expect(noExchangesText).not.toBeNull()
  })

  test('should clean up subscriptions when disconnected', async () => {
    const unsubscribeSpy = vi.fn()
    const subscribeSpy = vi.spyOn(PayController, 'subscribeKey').mockReturnValue(unsubscribeSpy)

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    expect(subscribeSpy).toHaveBeenCalled()

    element.remove()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  test('should call handlePayment on main button click if wallet connected', async () => {
    // Mock connected state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      ...(mockConnectionState as any)
    } as unknown as AccountState)

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const connectedView = element.shadowRoot?.querySelector('[data-testid="wallet-payment-option"]')
    await connectedView?.dispatchEvent(new Event('click'))

    expect(PayController.handlePayWithWallet).toHaveBeenCalledOnce()
  })

  test('should render pay with wallet section when network is supported', async () => {
    vi.mocked(isPayWithWalletSupported).mockReturnValue(true)
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const walletPaymentOption = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    )
    const separator = element.shadowRoot?.querySelector('wui-separator')

    expect(walletPaymentOption).not.toBeNull()
    expect(separator).not.toBeNull()
  })

  test('should not render pay with wallet section when network is not supported', async () => {
    vi.mocked(isPayWithWalletSupported).mockReturnValue(false)
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const walletPaymentOption = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    )
    const separator = element.shadowRoot?.querySelector('wui-separator')

    expect(walletPaymentOption).toBeNull()
    expect(separator).toBeNull()
  })
})
