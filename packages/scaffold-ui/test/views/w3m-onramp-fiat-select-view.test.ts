import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AssetController,
  ModalController,
  OnRampController,
  OptionsController,
  OptionsStateController,
  type PaymentCurrency
} from '@reown/appkit-controllers'

import { W3mOnrampFiatSelectView } from '../../src/views/w3m-onramp-fiat-select-view'

// --- Constants ---------------------------------------------------- //
const mockCurrencies: PaymentCurrency[] = [
  { id: 'USD', payment_method_limits: [] },
  { id: 'EUR', payment_method_limits: [] }
]

describe('W3mOnrampFiatSelectView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      paymentCurrency: mockCurrencies[0] as PaymentCurrency,
      paymentCurrencies: mockCurrencies
    })

    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      currencyImages: {
        USD: 'https://example.com/usd.png',
        EUR: 'https://example.com/eur.png'
      }
    })

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: 'https://terms.com',
      privacyPolicyUrl: 'https://privacy.com',
      features: {
        legalCheckbox: true
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render currency list', async () => {
    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    await elementUpdated(element)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBe(2)

    const firstItem = listItems?.[0]
    if (firstItem) {
      expect(firstItem.getAttribute('imageSrc')).toBe('https://example.com/usd.png')
      expect(firstItem.textContent?.trim()).toBe('USD')
    }
  })

  it('should handle currency selection', async () => {
    const setPaymentCurrencySpy = vi.spyOn(OnRampController, 'setPaymentCurrency')
    const modalCloseSpy = vi.spyOn(ModalController, 'close')

    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    await elementUpdated(element)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    if (listItems?.[1]) {
      listItems[1].click()
    }

    expect(setPaymentCurrencySpy).toHaveBeenCalledWith(mockCurrencies[1])
    expect(modalCloseSpy).toHaveBeenCalled()
  })

  it('should disable currency selection when legal checkbox is unchecked', async () => {
    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    await elementUpdated(element)

    const container = element.shadowRoot?.querySelector('wui-flex')
    expect(container?.classList.contains('disabled')).toBe(true)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    if (listItems?.[0]) {
      expect(listItems[0].getAttribute('tabIdx')).toBe('-1')
    }
  })

  it('should enable currency selection when legal checkbox is checked', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: '...',
      privacyPolicyUrl: '...',
      features: {
        legalCheckbox: true
      }
    })
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    await elementUpdated(element)

    const checkbox = element.shadowRoot?.querySelector('w3m-legal-checkbox')
    const wuiCheckbox = checkbox?.shadowRoot?.querySelector('wui-checkbox')
    const input = wuiCheckbox?.shadowRoot?.querySelector('input')

    expect(input).not.toBeNull()

    input?.click()

    element.requestUpdate()
    await elementUpdated(element)

    const container = element.shadowRoot?.querySelector('wui-flex')
    expect(container?.classList.contains('disabled')).toBe(false)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    if (listItems?.[0]) {
      expect(listItems[0].getAttribute('tabIdx')).toBeNull()
    }
  })

  it('should handle subscription updates', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    await elementUpdated(element)

    const updatedCurrencies: PaymentCurrency[] = [mockCurrencies[0]] as PaymentCurrency[]
    const updatedState = {
      ...OnRampController.state,
      paymentCurrencies: updatedCurrencies,
      paymentCurrency: mockCurrencies[0] as PaymentCurrency
    }

    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue(updatedState)

    const updatedElement: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )
    await elementUpdated(updatedElement)

    const listItems = updatedElement.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBe(1)
  })

  it('should cleanup subscriptions on disconnect', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    const unsubscribeSpy = vi.fn()
    const subscribeSpy = vi.spyOn(OnRampController, 'subscribe').mockReturnValue(unsubscribeSpy)
    const subscribeKeySpy = vi
      .spyOn(AssetController, 'subscribeKey')
      .mockReturnValue(unsubscribeSpy)

    const element: W3mOnrampFiatSelectView = await fixture(
      html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
    )

    expect(subscribeSpy).toHaveBeenCalled()
    expect(subscribeKeySpy).toHaveBeenCalled()

    element.disconnectedCallback()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
