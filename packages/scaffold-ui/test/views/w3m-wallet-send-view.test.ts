import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi, expect as viExpect } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import { RouterController, SendController, SwapController } from '@reown/appkit-controllers'

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

describe('W3mWalletSendView', () => {
  beforeEach(() => {
    vi.spyOn(SwapController, 'getNetworkTokenPrice').mockResolvedValue()
    vi.spyOn(SwapController, 'getInitialGasPrice').mockResolvedValue({
      gasPrice: BigInt(1000),
      gasPriceInUSD: 0.1
    })
    vi.spyOn(SendController, 'fetchTokenBalance').mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
    SendController.resetSend()
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

    const button = element.shadowRoot?.querySelector('wui-button')
    expect(button?.textContent?.trim()).to.equal('Insufficient Funds')
    expect(button?.disabled).to.be.true
  })

  it('should show invalid address message for incorrect address', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    SendController.setToken(mockToken)
    SendController.setTokenAmount(50)
    SendController.setGasPrice(BigInt(1))
    SendController.setNetworkBalanceInUsd('100')

    SendController.setReceiverAddress('invalid-address')
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

    viExpect(routerSpy).toHaveBeenCalledWith('WalletSendPreview')
  })

  it('should fetch network price on initialization', async () => {
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    viExpect(SwapController.getNetworkTokenPrice).toHaveBeenCalled()
    viExpect(SwapController.getInitialGasPrice).toHaveBeenCalled()
  })

  it('should fetch balances on initialization', async () => {
    await fixture<W3mWalletSendView>(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)
    viExpect(SendController.fetchTokenBalance).toHaveBeenCalled()
  })

  it('should cleanup subscriptions on disconnect', async () => {
    const element = await fixture<W3mWalletSendView>(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()
    viExpect(unsubscribeSpy).toHaveBeenCalled()
  })
})
