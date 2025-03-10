import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AssetController,
  ModalController,
  OnRampController,
  type OnRampControllerState,
  type PaymentCurrency,
  type PurchaseCurrency
} from '@reown/appkit-core'

import { W3mInputCurrency } from '../../src/partials/w3m-onramp-input'

// --- Constants ---------------------------------------------------- //
const MOCK_PAYMENT_CURRENCIES: [PaymentCurrency, ...PaymentCurrency[]] = [
  { id: 'USD', payment_method_limits: [] },
  { id: 'EUR', payment_method_limits: [] }
]

const MOCK_PURCHASE_CURRENCIES: [PurchaseCurrency, ...PurchaseCurrency[]] = [
  { id: 'eth-id', name: 'Ethereum', symbol: 'ETH', networks: [] },
  { id: 'btc-id', name: 'Bitcoin', symbol: 'BTC', networks: [] }
]

const DEFAULT_STATE: OnRampControllerState = {
  selectedProvider: null,
  providers: [],
  error: null,
  quotesLoading: false,
  paymentCurrencies: [],
  purchaseCurrencies: [],
  paymentCurrency: MOCK_PAYMENT_CURRENCIES[0],
  purchaseCurrency: MOCK_PURCHASE_CURRENCIES[0]
}

describe('W3mInputCurrency', () => {
  let subscribeKeyMock: ReturnType<typeof vi.fn>
  let subscribeKeyCallbacks: Record<string, (value: any) => void> = {}

  beforeEach(() => {
    subscribeKeyCallbacks = {}
    subscribeKeyMock = vi.fn().mockImplementation((key: string, callback: (value: any) => void) => {
      subscribeKeyCallbacks[key] = callback
      return vi.fn()
    })

    vi.spyOn(OnRampController, 'getAvailableCurrencies').mockResolvedValue()
    vi.spyOn(OnRampController, 'subscribeKey').mockImplementation(subscribeKeyMock)
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...DEFAULT_STATE,
      paymentCurrencies: MOCK_PAYMENT_CURRENCIES,
      purchaseCurrencies: MOCK_PURCHASE_CURRENCIES,
      paymentCurrency: MOCK_PAYMENT_CURRENCIES[0],
      purchaseCurrency: MOCK_PURCHASE_CURRENCIES[0]
    } as OnRampControllerState)
    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      currencyImages: { USD: 'usd.png', EUR: 'eur.png' },
      tokenImages: { ETH: 'eth.png', BTC: 'btc.png' }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render with default properties', async () => {
    const element: W3mInputCurrency = await fixture(html`<w3m-onramp-input></w3m-onramp-input>`)

    expect(element.type).toBe('Token')
    expect(element.value).toBe(0)
  })

  it('should render loading state when currencies are not loaded', async () => {
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      selectedProvider: null,
      providers: [],
      error: null,
      quotesLoading: false,
      paymentCurrencies: [],
      purchaseCurrencies: [],
      paymentCurrency: MOCK_PAYMENT_CURRENCIES[0],
      purchaseCurrency: MOCK_PURCHASE_CURRENCIES[0]
    } as OnRampControllerState)

    const element: W3mInputCurrency = await fixture(html`<w3m-onramp-input></w3m-onramp-input>`)

    element.requestUpdate()
    await elementUpdated(element)

    const spinner = element.shadowRoot?.querySelector('wui-loading-spinner')
    expect(spinner).not.toBeNull()
  })

  it('should render fiat currency selector', async () => {
    const element: W3mInputCurrency = await fixture(
      html`<w3m-onramp-input type="Fiat"></w3m-onramp-input>`
    )

    subscribeKeyCallbacks['paymentCurrency']?.(MOCK_PAYMENT_CURRENCIES[0])

    element.requestUpdate()
    await elementUpdated(element)

    const currencyContainer = element.shadowRoot?.querySelector('.currency-container')
    expect(currencyContainer).not.toBeNull()

    const image = element.shadowRoot?.querySelector('wui-image')
    expect(image?.getAttribute('src')).toBe('usd.png')

    const text = element.shadowRoot?.querySelector('wui-text')
    expect(text?.textContent?.trim()).toBe('USD')
  })

  it('should render token currency selector', async () => {
    const element: W3mInputCurrency = await fixture(
      html`<w3m-onramp-input type="Token"></w3m-onramp-input>`
    )

    subscribeKeyCallbacks['purchaseCurrency']?.(MOCK_PURCHASE_CURRENCIES[0])

    element.requestUpdate()
    await elementUpdated(element)

    const currencyContainer = element.shadowRoot?.querySelector('.currency-container')
    expect(currencyContainer).not.toBeNull()

    const image = element.shadowRoot?.querySelector('wui-image')
    expect(image?.getAttribute('src')).toBe('eth.png')

    const text = element.shadowRoot?.querySelector('wui-text')
    expect(text?.textContent?.trim()).toBe('ETH')
  })

  it('should open modal on currency container click', async () => {
    const modalSpy = vi.spyOn(ModalController, 'open')
    const element: W3mInputCurrency = await fixture(html`<w3m-onramp-input></w3m-onramp-input>`)

    subscribeKeyCallbacks['purchaseCurrency']?.(MOCK_PURCHASE_CURRENCIES[0])

    element.requestUpdate()
    await elementUpdated(element)

    const currencyContainer = element.shadowRoot?.querySelector(
      '.currency-container'
    ) as HTMLElement
    currencyContainer?.click()

    expect(modalSpy).toHaveBeenCalledWith({ view: 'OnRampTokenSelect' })
  })

  it('should update selected currency when payment currency changes', async () => {
    const element: W3mInputCurrency = await fixture(
      html`<w3m-onramp-input type="Fiat"></w3m-onramp-input>`
    )

    subscribeKeyCallbacks['paymentCurrency']?.({ id: 'EUR', payment_method_limits: [] })

    element.requestUpdate()
    await elementUpdated(element)

    const text = element.shadowRoot?.querySelector('wui-text')
    expect(text?.textContent?.trim()).toBe('EUR')
  })

  it('should update selected currency when purchase currency changes', async () => {
    const element: W3mInputCurrency = await fixture(
      html`<w3m-onramp-input type="Token"></w3m-onramp-input>`
    )

    subscribeKeyCallbacks['purchaseCurrency']?.({
      id: 'BTC',
      name: 'Bitcoin',
      symbol: 'BTC',
      networks: []
    })

    element.requestUpdate()
    await elementUpdated(element)

    const text = element.shadowRoot?.querySelector('wui-text')
    expect(text?.textContent?.trim()).toBe('BTC')
  })

  it('should call getAvailableCurrencies on first update', async () => {
    const getAvailableCurrenciesSpy = vi.spyOn(OnRampController, 'getAvailableCurrencies')

    await fixture(html`<w3m-onramp-input></w3m-onramp-input>`)

    expect(getAvailableCurrenciesSpy).toHaveBeenCalled()
  })

  it('should unsubscribe from controllers on disconnect', async () => {
    const element: W3mInputCurrency = await fixture(html`<w3m-onramp-input></w3m-onramp-input>`)

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
