import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  ConnectionController,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-controllers'

import { W3mWalletSendView } from '../../src/views/w3m-wallet-send-view'

const mockToken: Balance = {
  address: '0x123',
  symbol: 'TEST',
  name: 'Test Token',
  quantity: {
    numeric: '100',
    decimals: '18'
  },
  price: 1,
  chainId: '1',
  iconUrl: 'https://example.com/icon.png'
}

let originalAnimate: any

describe('W3mWalletSendView', () => {
  beforeEach(() => {
    originalAnimate = Element.prototype.animate
    Element.prototype.animate = vi.fn().mockImplementation(function () {
      return {}
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: '0x123456789abcdef123456789abcdef123456789a'
    } as unknown as AccountState)
    vi.spyOn(SwapController, 'getNetworkTokenPrice').mockResolvedValue()
    vi.spyOn(SendController, 'fetchTokenBalance').mockResolvedValue([])
    vi.spyOn(ConnectionController, 'getEnsAddress').mockImplementation((ensName: string) => {
      if (ensName === 'enes.wcn.id') {
        return Promise.resolve('0x123456789abcdef123456789abcdef123456789a')
      }

      throw new Error('Invalid ENS name')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    SendController.resetSend()
    Element.prototype.animate = originalAnimate
  })

  it('should render initial state correctly', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    expect(element).to.exist
    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button).to.exist
    expect(button?.textContent?.trim()).to.equal('Select Token')
    expect(button?.disabled).to.be.true
  })

  it('should update message when token is selected', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Add Amount')
    expect(button?.disabled).to.be.true
  })

  it('should update message when amount is set', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setNetworkBalanceInUsd('100')

    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Add Address')
    expect(button?.disabled).to.be.true
  })

  it('should show insufficient funds message when amount exceeds balance', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(150)
    SendController.setReceiverAddress('0x456')
    await element.updateComplete
    await element.render()

    const [fundWalletButton, connectDifferentWalletButton] =
      element.shadowRoot?.querySelectorAll('wui-button') ?? []

    expect(fundWalletButton?.textContent?.trim()).to.equal('Fund Wallet')
    expect(connectDifferentWalletButton?.textContent?.trim()).to.equal('Connect a different wallet')
  })

  it('should show invalid address message for incorrect address and persist when input cleared', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setNetworkBalanceInUsd('100')

    SendController.setReceiverAddress('invalid-address')
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Invalid Address')
    expect(button?.disabled).to.be.true

    const addressInput = element.shadowRoot?.querySelector('w3m-input-address') as HTMLElement
    addressInput.click()
    const textarea = addressInput.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = ''
    textarea.dispatchEvent(new InputEvent('input'))
    await element.updateComplete
    await element.render()

    expect(button?.textContent?.trim()).to.equal('Invalid Address')
    expect(button?.disabled).to.be.true
  })

  it('should enable button when valid ENS address is entered', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setNetworkBalanceInUsd('100')

    const addressInput = element.shadowRoot?.querySelector('w3m-input-address') as HTMLElement
    addressInput.click()
    const textarea = addressInput.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'enes.wcn.id'
    textarea.dispatchEvent(new InputEvent('input'))
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait for debounce
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Preview Send')
    expect(button?.disabled).to.be.false
  })

  it('should disable button when invalid ENS address is entered', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setNetworkBalanceInUsd('100')

    const addressInput = element.shadowRoot?.querySelector('w3m-input-address') as HTMLElement
    addressInput.click()
    const textarea = addressInput.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'enestest.wcn.id'
    textarea.dispatchEvent(new InputEvent('input'))
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait for debounce
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Invalid Address')
    expect(button?.disabled).to.be.true
  })

  it('should enable preview when all inputs are valid', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setReceiverAddress('0x123456789abcdef123456789abcdef123456789a')
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Preview Send')
    expect(button?.disabled).to.be.false
  })

  it('should navigate to preview on button click', async () => {
    const routerSpy = vi.spyOn(RouterController, 'push')
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setReceiverAddress('0x123456789abcdef123456789abcdef123456789a')
    await element.updateComplete
    await element.render()

    const button = element.shadowRoot?.querySelector('wui-button')
    button?.click()

    expect(routerSpy).toHaveBeenCalledWith('WalletSendPreview', {
      send: undefined
    })
  })

  it('should fetch network price on initialization if token is set', async () => {
    SendController.setToken(mockToken)
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    expect(SwapController.getNetworkTokenPrice).toHaveBeenCalled()
  })

  it('should not fetch network price on initialization if no token is set', async () => {
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)
    expect(SwapController.getNetworkTokenPrice).toHaveBeenCalledTimes(0)
  })

  it('should not fetch balances on initialization if no token is set', async () => {
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)
    expect(SendController.fetchTokenBalance).toHaveBeenCalledTimes(0)
  })

  it('should fetch balances on initialization if token is set', async () => {
    SendController.setToken(mockToken)
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)
    expect(SendController.fetchTokenBalance).toHaveBeenCalled()
  })

  it('should cleanup subscriptions on disconnect', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()
    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
