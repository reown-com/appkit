import { W3mWalletSendView } from '../../src/views/w3m-wallet-send-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import {
  SwapController,
  SendController,
  AccountController,
  ChainController,
  RouterController,
  type ChainControllerState
} from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { Balance } from '@reown/appkit-common'

describe('W3mWalletSendView', () => {
  const mockToken = {
    quantity: { numeric: '100' },
    price: 1,
    symbol: 'TEST'
  } as Balance

  beforeEach(() => {
    vi.spyOn(SendController, 'state', 'get').mockReturnValue({
      sendTokenAmount: 0,
      receiverAddress: '',
      receiverProfileName: '',
      loading: false,
      gasPriceInUSD: 0,
      gasPrice: 0n
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'eip155'
    } as ChainControllerState)

    vi.spyOn(SwapController, 'getNetworkTokenPrice').mockResolvedValue()
    vi.spyOn(SwapController, 'getInitialGasPrice').mockResolvedValue({
      gasPrice: 1000n,
      gasPriceInUSD: 2
    })
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue()
    vi.spyOn(SendController, 'subscribe').mockImplementation(() => () => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial state correctly', async () => {
    const element: W3mWalletSendView = await fixture(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )

    expect(HelpersUtil.querySelect(element, 'w3m-input-token')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'w3m-input-address')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'wui-button')).toBeTruthy()
  })

  it('fetches initial data on mount', async () => {
    await fixture(html`<w3m-wallet-send-view></w3m-wallet-send-view>`)

    expect(SwapController.getNetworkTokenPrice).toHaveBeenCalled()
    expect(SwapController.getInitialGasPrice).toHaveBeenCalled()
    expect(AccountController.fetchTokenBalance).toHaveBeenCalled()
  })

  describe('Message States', () => {
    vi.spyOn(SendController, 'hasInsufficientGasFunds').mockReturnValue(false)

    it('shows "Select Token" when no token selected', async () => {
      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Select Token')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Add Amount" when token selected but no amount', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Add Amount')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Add Address" when amount set but no address', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 50
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Add Address')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Invalid Address" for incorrect address format', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 50,
        receiverAddress: 'invalid-address'
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Invalid Address')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Insufficient Funds" when amount exceeds balance', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 150,
        receiverAddress: '0x123'
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Insufficient Funds')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Insufficient Gas Funds" when gas funds are insufficient', async () => {
      vi.spyOn(SendController, 'hasInsufficientGasFunds').mockReturnValueOnce(true)
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 50,
        receiverAddress: '0x123'
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Insufficient Gas Funds')
      expect(button?.hasAttribute('disabled')).toBe(true)
    })

    it('shows "Preview Send" when all conditions are met', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 50,
        receiverAddress: '0x9b9F68919cA50043528Ed79524bB00Ee6E6d7d1a'
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.textContent?.trim()).toBe('Preview Send')
      expect(button?.hasAttribute('disabled')).toBe(false)
    })
  })

  describe('Interactions', () => {
    it('navigates to preview on button click', async () => {
      const routerSpy = vi.spyOn(RouterController, 'push')
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        token: mockToken,
        sendTokenAmount: 50,
        receiverAddress: '0x123'
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      await button?.click()

      expect(routerSpy).toHaveBeenCalledWith('WalletSendPreview')
    })

    it('displays loading state correctly', async () => {
      vi.spyOn(SendController, 'state', 'get').mockReturnValue({
        ...SendController.state,
        loading: true
      })

      const element: W3mWalletSendView = await fixture(
        html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      )
      const button = HelpersUtil.querySelect(element, 'wui-button')
      expect(button?.hasAttribute('loading')).toBe(true)
    })
  })

  it('cleans up subscriptions on disconnect', async () => {
    const element: W3mWalletSendView = await fixture(
      html`<w3m-wallet-send-view></w3m-wallet-send-view>`
    )
    const unsubscribeSpy = vi.fn()
    ;(element as any).unsubscribe = [unsubscribeSpy]

    element.disconnectedCallback()
    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
