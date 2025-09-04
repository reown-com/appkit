import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AssetController,
  ModalController,
  OnRampController,
  OptionsController,
  OptionsStateController,
  type PurchaseCurrency
} from '@reown/appkit-controllers'

import { W3mOnrampTokensView } from '../../src/views/w3m-onramp-tokens-select-view'

// --- Constants ---------------------------------------------------- //
const mockTokens: PurchaseCurrency[] = [
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] },
  { id: 'MATIC', symbol: 'MATIC', name: 'Polygon', networks: [] }
]

const mockTokenImages = {
  ETH: 'ethereum.png',
  MATIC: 'polygon.png'
}

describe('W3mOnrampTokensView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      purchaseCurrencies: mockTokens
    })

    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      tokenImages: mockTokenImages
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

  it('should render token list', async () => {
    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBe(2)

    const firstToken = listItems?.[0]
    expect(firstToken?.getAttribute('imageSrc')).toBe('ethereum.png')
    const tokenName = firstToken?.querySelector('wui-text[variant="md-medium"]')
    expect(tokenName?.textContent).toBe('Ethereum')
    const tokenSymbol = firstToken?.querySelector('wui-text[variant="sm-regular"]')
    expect(tokenSymbol?.textContent).toBe('ETH')
  })

  it('should handle token selection', async () => {
    const setPurchaseCurrencySpy = vi.spyOn(OnRampController, 'setPurchaseCurrency')
    const modalCloseSpy = vi.spyOn(ModalController, 'close')

    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    listItems?.[0]?.click()

    expect(setPurchaseCurrencySpy).toHaveBeenCalledWith(mockTokens[0])
    expect(modalCloseSpy).toHaveBeenCalled()
  })

  it('should handle subscription updates', async () => {
    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    const updatedTokens = [mockTokens[0]]
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      purchaseCurrencies: updatedTokens as PurchaseCurrency[]
    })

    // Create new instance to get updated state
    const updatedElement: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )
    await elementUpdated(updatedElement)

    const listItems = updatedElement.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBe(1)
  })

  it('should handle legal checkbox interaction', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: '...',
      privacyPolicyUrl: '...',
      features: {
        legalCheckbox: true
      }
    })

    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    const listContainer = element.shadowRoot?.querySelector('wui-flex')
    expect(listContainer?.classList.contains('disabled')).toBe(true)

    const checkbox = element.shadowRoot?.querySelector('w3m-legal-checkbox')
    const wuiCheckbox = checkbox?.shadowRoot?.querySelector('wui-checkbox')
    const input = wuiCheckbox?.shadowRoot?.querySelector('input')

    expect(input).not.toBeNull()

    input?.click()

    element.requestUpdate()
    await elementUpdated(element)

    expect(listContainer?.classList.contains('disabled')).toBe(false)
  })

  it('should handle token image updates', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        legalCheckbox: false
      }
    })
    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    const updatedImages = { ...mockTokenImages, ETH: 'new-ethereum.png' }
    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      tokenImages: updatedImages
    })

    const updatedElement: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )
    await elementUpdated(updatedElement)

    const listItems = updatedElement.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.[0]?.getAttribute('imageSrc')).toBe('new-ethereum.png')
  })

  it('should cleanup subscriptions on disconnect', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        legalCheckbox: false
      }
    })
    const element: W3mOnrampTokensView = await fixture(
      html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
    )

    await elementUpdated(element)

    element.disconnectedCallback()

    const updatedTokens = [mockTokens[0]]
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      purchaseCurrencies: updatedTokens as PurchaseCurrency[]
    })

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBe(2)
  })
})
