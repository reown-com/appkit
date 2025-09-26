import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ChainController, ModalController, OnRampController } from '@reown/appkit-controllers'

import '../../src/modal/w3m-onramp-widget'

describe('W3mOnrampWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render connect button when wallet is not connected', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipAddress: undefined
    })

    const el = (await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)) as HTMLElement & {
      shadowRoot: ShadowRoot
    }
    await elementUpdated(el)

    const buttons = el.shadowRoot?.querySelectorAll('wui-button')

    const actionBtn = buttons?.[buttons.length - 1]
    expect(actionBtn).toBeTruthy()
    expect(actionBtn?.textContent?.trim()).toBe('Connect wallet')
  })

  it('should open Connect view when clicking connect button', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipAddress: undefined
    })
    const openSpy = vi.spyOn(ModalController, 'open')

    const el = await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)
    await elementUpdated(el)

    const buttons = el.shadowRoot?.querySelectorAll('wui-button')
    const actionBtn = buttons?.[buttons.length - 1] as HTMLElement | null

    actionBtn?.click()

    expect(openSpy).toHaveBeenCalledWith({ view: 'Connect' })
  })

  it('should render quotes button when wallet is connected', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipAddress: 'eip155:1:0xabc'
    })

    const el = (await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)) as HTMLElement & {
      shadowRoot: ShadowRoot
    }
    await elementUpdated(el)

    const btns = el.shadowRoot?.querySelectorAll('wui-button')

    const actionBtn = btns?.[btns.length - 1]

    expect(actionBtn).toBeTruthy()
    expect(actionBtn?.textContent?.trim()).toBe('Get quotes')
  })

  it('should open OnRampProviders when clicking quotes button and not loading', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipAddress: 'eip155:1:0xabc'
    })
    vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
      ...ModalController.state,
      loading: false
    })
    const openSpy = vi.spyOn(ModalController, 'open')

    const el = (await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)) as HTMLElement & {
      shadowRoot: ShadowRoot
    }
    await elementUpdated(el)

    const btns = el.shadowRoot?.querySelectorAll('wui-button')
    const actionBtn = btns?.[btns.length - 1]

    actionBtn?.click()

    expect(openSpy).toHaveBeenCalledWith({ view: 'OnRampProviders' })
  })

  it('should update payment amount and fetch quote on input change', async () => {
    const setPaymentAmountSpy = vi.spyOn(OnRampController, 'setPaymentAmount')
    const getQuoteSpy = vi.spyOn(OnRampController, 'getQuote').mockResolvedValue(null)

    const el = (await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)) as HTMLElement & {
      shadowRoot: ShadowRoot
    }
    await elementUpdated(el)

    const fiatInput = el.shadowRoot?.querySelector('w3m-onramp-input[type="Fiat"]')
    expect(fiatInput).toBeTruthy()

    fiatInput?.dispatchEvent(
      new CustomEvent('inputChange', { detail: '250', bubbles: true, composed: true })
    )

    expect(setPaymentAmountSpy).toHaveBeenCalledWith(250)
    expect(getQuoteSpy).toHaveBeenCalled()
  })

  it('should set preset amount and fetch quote when clicking preset button', async () => {
    const setPaymentAmountSpy = vi.spyOn(OnRampController, 'setPaymentAmount')
    const getQuoteSpy = vi.spyOn(OnRampController, 'getQuote').mockResolvedValue(null)

    const el = (await fixture(html`<w3m-onramp-widget></w3m-onramp-widget>`)) as HTMLElement & {
      shadowRoot: ShadowRoot
    }
    await elementUpdated(el)

    const buttons = Array.from(el.shadowRoot?.querySelectorAll('wui-button') || [])
    const presetBtn = buttons.find(btn => btn.textContent?.trim()?.includes('100'))

    expect(presetBtn).toBeTruthy()

    presetBtn?.click()

    expect(setPaymentAmountSpy).toHaveBeenCalledWith(100)
    expect(getQuoteSpy).toHaveBeenCalled()
  })
})
