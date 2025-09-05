import { elementUpdated, fixture } from '@open-wc/testing'
import { describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { EventsController, RouterController, type SwapToken } from '@reown/appkit-controllers'

import { W3mSwapInput } from '../../src/partials/w3m-swap-input'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const MOCK_TOKEN: SwapToken = {
  symbol: 'ETH',
  decimals: 18,
  address: 'eip155:1:0x123',
  name: 'Ethereum',
  logoUri: 'https://ethereum.org/eth-logo.png'
}

describe('W3mSwapInput', () => {
  it('should render with default properties', async () => {
    const element = await fixture<W3mSwapInput>(html`<w3m-swap-input></w3m-swap-input>`)

    expect(element.target).toBe('sourceToken')
    expect(element.focused).toBe(false)
    expect(element.disabled).toBe(undefined)
    expect(element.value).toBe(undefined)
    expect(element.price).toBe(0)
    expect(element.token).toBe(undefined)
  })

  it('should render select token button when no token is selected', async () => {
    const element = await fixture<W3mSwapInput>(html`<w3m-swap-input></w3m-swap-input>`)

    const selectButton = HelpersUtil.querySelect(
      element,
      '[data-testid="swap-select-token-button-sourceToken"]'
    )
    expect(selectButton).not.toBeNull()
    expect(selectButton?.textContent?.trim()).toBe('Select token')
  })

  it('should render token button when token is selected', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .token=${MOCK_TOKEN}></w3m-swap-input>`
    )

    const tokenButton = HelpersUtil.querySelect(
      element,
      '[data-testid="swap-input-token-sourceToken"]'
    )
    expect(tokenButton).not.toBeNull()
    expect(tokenButton?.getAttribute('text')).toBe('ETH')
    expect(tokenButton?.getAttribute('imageSrc')).toBe('https://ethereum.org/eth-logo.png')
  })

  it('should handle input changes', async () => {
    const onSetAmount = vi.fn()
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .onSetAmount=${onSetAmount}></w3m-swap-input>`
    )

    const input = HelpersUtil.querySelect(element, 'input') as HTMLInputElement
    input.value = '1.5'
    input.dispatchEvent(new InputEvent('input'))

    expect(onSetAmount).toHaveBeenCalledWith('sourceToken', '1.5')
  })

  it('should handle dot as first character when user types it', async () => {
    const onSetAmount = vi.fn()
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .onSetAmount=${onSetAmount}></w3m-swap-input>`
    )

    const input = HelpersUtil.querySelect(element, 'input') as HTMLInputElement

    input.value = '.'
    input.dispatchEvent(new InputEvent('input'))
    expect(onSetAmount).toHaveBeenLastCalledWith('sourceToken', '0.')
  })

  it('should filter out non-numeric characters as user types', async () => {
    const onSetAmount = vi.fn()
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .onSetAmount=${onSetAmount}></w3m-swap-input>`
    )

    const input = HelpersUtil.querySelect(element, 'input') as HTMLInputElement

    input.value = '1a'
    input.dispatchEvent(new InputEvent('input'))
    expect(onSetAmount).toHaveBeenLastCalledWith('sourceToken', '1')

    input.value = '1a2'
    input.dispatchEvent(new InputEvent('input'))
    expect(onSetAmount).toHaveBeenLastCalledWith('sourceToken', '12')

    input.value = '1a2b3'
    input.dispatchEvent(new InputEvent('input'))
    expect(onSetAmount).toHaveBeenLastCalledWith('sourceToken', '123')
  })

  it('should handle focus states', async () => {
    const element = await fixture<W3mSwapInput>(html`<w3m-swap-input></w3m-swap-input>`)

    const input = HelpersUtil.querySelect(element, 'input') as HTMLInputElement
    input.dispatchEvent(new FocusEvent('focusin'))
    await elementUpdated(element)
    expect(element.focused).toBe(true)

    input.dispatchEvent(new FocusEvent('focusout'))
    await elementUpdated(element)
    expect(element.focused).toBe(false)
  })

  it('should display market value when greater than zero', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .marketValue=${'1.5'}></w3m-swap-input>`
    )

    const marketValue = HelpersUtil.querySelect(element, '.market-value')
    expect(marketValue?.textContent?.trim()).toBe('$1.50')
  })

  it('should not display market value when zero', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .marketValue=${'0'}></w3m-swap-input>`
    )

    const marketValue = HelpersUtil.querySelect(element, '.market-value')
    expect(marketValue?.textContent?.trim()).toBe('')
  })

  it('should display balance when token has sufficient value', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input .token=${MOCK_TOKEN} .balance=${'1.0'} .price=${1.0}></w3m-swap-input>`
    )

    const balance = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || []).find(text =>
      text.textContent?.includes('1.00')
    )
    expect(balance).not.toBeNull()
  })

  it('should show max button for source token with balance', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input
        .token=${MOCK_TOKEN}
        .balance=${'1.0'}
        .price=${1.0}
        target="sourceToken"
      ></w3m-swap-input>`
    )

    const maxButton = Array.from(
      element.shadowRoot?.querySelectorAll('.max-value-button') || []
    ).find(button => button.textContent?.includes('Max')) as HTMLElement | undefined
    expect(maxButton).not.toBeNull()
  })

  it('should show buy button for source token without balance', async () => {
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input
        .token=${MOCK_TOKEN}
        .balance=${'0'}
        .price=${1.0}
        target="sourceToken"
      ></w3m-swap-input>`
    )

    const buyButton = Array.from(
      element.shadowRoot?.querySelectorAll('.max-value-button') || []
    ).find(button => button.textContent?.includes('Buy')) as HTMLElement | undefined
    expect(buyButton).not.toBeNull()
  })

  it('should handle max value click', async () => {
    const onSetMaxValue = vi.fn()
    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input
        .token=${MOCK_TOKEN}
        .balance=${'1.0'}
        .price=${1.0}
        target="sourceToken"
        .onSetMaxValue=${onSetMaxValue}
      ></w3m-swap-input>`
    )

    const maxButton = Array.from(
      element.shadowRoot?.querySelectorAll('.max-value-button') || []
    ).find(button => button.textContent?.includes('Max')) as HTMLElement | undefined
    maxButton?.click()

    expect(onSetMaxValue).toHaveBeenCalledWith('sourceToken', '1.0')
  })

  it('should navigate to token selection on token button click', async () => {
    const routerSpy = vi.spyOn(RouterController, 'push')
    const eventsSpy = vi.spyOn(EventsController, 'sendEvent')

    const element = await fixture<W3mSwapInput>(html`<w3m-swap-input></w3m-swap-input>`)

    const selectButton = HelpersUtil.querySelect(
      element,
      '[data-testid="swap-select-token-button-sourceToken"]'
    ) as HTMLElement
    selectButton?.click()

    expect(eventsSpy).toHaveBeenCalledWith({ type: 'track', event: 'CLICK_SELECT_TOKEN_TO_SWAP' })
    expect(routerSpy).toHaveBeenCalledWith('SwapSelectToken', { target: 'sourceToken' })
  })

  it('should navigate to onramp providers on buy button click', async () => {
    const routerSpy = vi.spyOn(RouterController, 'push')

    const element = await fixture<W3mSwapInput>(
      html`<w3m-swap-input
        .token=${MOCK_TOKEN}
        .balance=${'0'}
        .price=${1.0}
        target="sourceToken"
      ></w3m-swap-input>`
    )

    const buyButton = Array.from(
      element.shadowRoot?.querySelectorAll('.max-value-button') || []
    ).find(button => button.textContent?.includes('Buy')) as HTMLElement | undefined
    buyButton?.click()

    expect(routerSpy).toHaveBeenCalledWith('OnRampProviders')
  })
})
