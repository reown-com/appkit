import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import type { CaipAddress } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  ModalController
} from '@reown/appkit-controllers'

import { PayController } from '../../src/controllers/PayController'
import type { Exchange } from '../../src/types/exchange'
import type { PaymentAsset } from '../../src/types/options'
import type { Quote, QuoteStatus } from '../../src/types/quote'
import { W3mPayLoadingView } from '../../src/ui/w3m-pay-loading-view'

// -- Constants ------------------------------------------------ //
const mockPaymentAsset: PaymentAsset = {
  network: 'eip155:1',
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  metadata: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6
  }
}

const mockQuote: Quote = {
  origin: {
    amount: '1000000',
    currency: {
      network: 'eip155:1',
      asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      metadata: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
      }
    }
  },
  destination: {
    amount: '1000000',
    currency: {
      network: 'eip155:137',
      asset: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      metadata: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
      }
    }
  },
  timeInSeconds: 30,
  steps: [],
  fees: []
}

const mockExchange: Exchange = {
  id: 'mock-exchange',
  name: 'Mock Exchange',
  imageUrl: ''
}

const mockCaipNetwork = {
  id: '1',
  name: 'Ethereum',
  chainId: 1,
  chainNamespace: 'eip155' as const,
  caipNetworkId: 'eip155:1' as const,
  imageId: 'ethereum',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['']
    }
  }
}

describe('W3mPayLoadingView', () => {
  let subscribeKeyCallbacks: Map<string, Function> = new Map()
  let subscribeChainPropCallback: Function | null = null
  let pollingInterval: NodeJS.Timeout | null = null

  beforeAll(() => {
    if (!customElements.get('w3m-pay-loading-view')) {
      customElements.define('w3m-pay-loading-view', W3mPayLoadingView)
    }
  })

  beforeEach(() => {
    subscribeKeyCallbacks.clear()
    subscribeChainPropCallback = null
    pollingInterval = null

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      paymentAsset: mockPaymentAsset,
      quoteStatus: 'waiting' as QuoteStatus,
      quote: mockQuote,
      amount: 0,
      selectedExchange: undefined,
      requestId: 'test-request-id'
    })
    vi.spyOn(PayController, 'subscribeKey').mockImplementation((key, callback) => {
      subscribeKeyCallbacks.set(key as string, callback)
      return vi.fn()
    })
    vi.spyOn(PayController, 'fetchQuoteStatus').mockResolvedValue(undefined)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([mockCaipNetwork])
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      currentTab: 0,
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as CaipAddress,
      profileName: 'Test User',
      addressLabels: new Map()
    })
    vi.spyOn(ChainController, 'subscribeChainProp').mockImplementation((prop, callback) => {
      if (prop === 'accountState') {
        subscribeChainPropCallback = callback
      }
      return vi.fn()
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'mock-connector',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        sui: undefined,
        stacks: undefined,
        ton: undefined
      }
    })
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation((key, callback) => {
      subscribeKeyCallbacks.set(`connector-${key as string}`, callback)
      return vi.fn()
    })
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({
      id: 'mock-connector',
      name: 'Mock Wallet',
      type: 'WALLET_CONNECT',
      imageUrl: '',
      chain: 'eip155'
    })
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('')
    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('')
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
  })

  test('should render loading state with pulse animation', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'waiting',
      amount: 1
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const pulse = element.shadowRoot?.querySelector('wui-pulse')

    expect(pulse).not.toBeNull()
    expect(pulse?.getAttribute('size')).toBe('125px')
    expect(pulse?.getAttribute('rings')).toBe('3')

    const icon = element.shadowRoot?.querySelector('wui-icon[name="paperPlaneTitle"]')

    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('color')).toBe('accent-primary')

    const badge = element.shadowRoot?.querySelector('.token-badge')

    expect(badge).not.toBeNull()

    const amountText = badge?.textContent?.trim()

    expect(amountText).toContain('1')
    expect(amountText).toContain('USDC')
  })

  test('should render success state with checkmark icon', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'success'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const successIcon = element.shadowRoot?.querySelector(
      '.token-image.success wui-icon[name="checkmark"]'
    )

    expect(successIcon).not.toBeNull()
    expect(successIcon?.getAttribute('color')).toBe('success')

    const pulse = element.shadowRoot?.querySelector('wui-pulse')

    expect(pulse).toBeNull()
  })

  test('should render failure state with close icon', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'failure'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const errorIcon = element.shadowRoot?.querySelector('.token-image.error wui-icon[name="close"]')

    expect(errorIcon).not.toBeNull()
    expect(errorIcon?.getAttribute('color')).toBe('error')

    const pulse = element.shadowRoot?.querySelector('wui-pulse')

    expect(pulse).toBeNull()
  })

  test('should render timeout state with close icon', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'timeout'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const errorIcon = element.shadowRoot?.querySelector('.token-image.error wui-icon[name="close"]')

    expect(errorIcon).not.toBeNull()
  })

  test('should render refund state with close icon', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'refund'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const errorIcon = element.shadowRoot?.querySelector('.token-image.error wui-icon[name="close"]')

    expect(errorIcon).not.toBeNull()
  })

  test('should display payment method details correctly', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const paymentMethodLabel = texts.find(el => el.textContent?.trim() === 'Payment Method')

    expect(paymentMethodLabel).toBeDefined()

    const amountText = texts.find(el => el.textContent?.trim() === '1')

    expect(amountText).toBeDefined()

    const symbolText = texts.find(el => el.textContent?.trim() === 'USDC')

    expect(symbolText).toBeDefined()

    const networkText = texts.find(el => el.textContent?.trim() === 'Ethereum')

    expect(networkText).toBeDefined()
  })

  test('should display wallet information with profile name', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])

    const walletLabel = texts.find(el => el.textContent?.trim() === 'Wallet')

    expect(walletLabel).toBeDefined()

    const profileName = texts.find(el => el.textContent?.trim().includes('Test User'))

    expect(profileName).toBeDefined()
  })

  test('should display wallet information with truncated address when no profile name', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      currentTab: 0,
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as CaipAddress,
      profileName: null,
      addressLabels: new Map()
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])

    const addressText = texts.find(el => {
      const text = el.textContent?.trim()

      return text?.includes('0x12') && text?.includes('567890')
    })

    expect(addressText).toBeDefined()
  })

  test('should display exchange information when selectedExchange is set', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      selectedExchange: mockExchange
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])

    const exchangeName = texts.find(el => el.textContent?.trim() === 'Mock Exchange')

    expect(exchangeName).toBeDefined()
  })

  test('should display payment lifecycle steps', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])

    const header = texts.find(el => el.textContent?.trim() === 'PAYMENT CYCLE')

    expect(header).toBeDefined()

    const receivingStep = texts.find(el => el.textContent?.trim() === 'Receiving funds')

    expect(receivingStep).toBeDefined()

    const swappingStep = texts.find(el => el.textContent?.trim() === 'Swapping asset')

    expect(swappingStep).toBeDefined()

    const sendingStep = texts.find(
      el => el.textContent?.trim() === 'Sending asset to the recipient address'
    )

    expect(sendingStep).toBeDefined()

    const dollarIcon = element.shadowRoot?.querySelector('wui-icon[name="dollar"]')

    expect(dollarIcon).not.toBeNull()

    const recycleIcon = element.shadowRoot?.querySelector('wui-icon[name="recycleHorizontal"]')

    expect(recycleIcon).not.toBeNull()

    const sendIcon = element.shadowRoot?.querySelector('wui-icon[name="send"]')

    expect(sendIcon).not.toBeNull()
  })

  test('should show loading spinners for pending steps', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'waiting'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const spinners = element.shadowRoot?.querySelectorAll('wui-loading-spinner')

    expect(spinners?.length).toBe(3)
  })

  test('should show checkmarks for completed steps when status is pending', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'pending'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const stepBoxes = element.shadowRoot?.querySelectorAll('.step-icon-box')

    const successBoxes = Array.from(stepBoxes || []).filter(box =>
      box.classList.contains('success')
    )

    expect(successBoxes.length).toBe(1)

    const checkmarks = Array.from(
      element.shadowRoot?.querySelectorAll('wui-icon[name="checkmark"]') || []
    )

    const stepCheckmarks = checkmarks.filter(icon => icon.getAttribute('size') === 'sm')

    expect(stepCheckmarks.length).toBe(1)
  })

  test('should show checkmarks for all steps when status is success', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'success'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const stepBoxes = element.shadowRoot?.querySelectorAll('.step-icon-box')
    const successBoxes = Array.from(stepBoxes || []).filter(box =>
      box.classList.contains('success')
    )

    expect(successBoxes.length).toBe(3)

    const checkmarks = Array.from(
      element.shadowRoot?.querySelectorAll('wui-icon[name="checkmark"]') || []
    )
    const stepCheckmarks = checkmarks.filter(icon => icon.getAttribute('size') === 'sm')

    expect(stepCheckmarks.length).toBe(3)
  })

  test('should show close icons for all steps when status is failure', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'failure'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const closeIcons = Array.from(
      element.shadowRoot?.querySelectorAll('wui-icon[name="close"]') || []
    )
    const stepCloseIcons = closeIcons.filter(icon => icon.getAttribute('size') === 'sm')

    expect(stepCloseIcons.length).toBe(3)
  })

  test('should display time estimate badge when in progress', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'waiting',
      quote: { ...mockQuote, timeInSeconds: 45 }
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const clockIcon = element.shadowRoot?.querySelector('wui-icon[name="clock"]')

    expect(clockIcon).not.toBeNull()

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const timeText = texts.find(el => el.textContent?.trim().includes('Est. 45 sec'))

    expect(timeText).toBeDefined()
  })

  test('should display completed badge when status is success', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'success'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const completedText = texts.find(el => el.textContent?.trim() === 'Completed')

    expect(completedText).toBeDefined()
    expect(completedText?.getAttribute('color')).toBe('success')

    const badges = element.shadowRoot?.querySelectorAll('.payment-step-badge.success')

    expect(badges?.length).toBeGreaterThan(0)
  })

  test('should display failed badge when status is failure', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'failure'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const failedText = texts.find(el => el.textContent?.trim() === 'Failed')

    expect(failedText).toBeDefined()
    expect(failedText?.getAttribute('color')).toBe('error')

    const badges = element.shadowRoot?.querySelectorAll('.payment-step-badge.error')

    expect(badges?.length).toBeGreaterThan(0)
  })

  test('should start polling on component mount', async () => {
    await fixture<W3mPayLoadingView>(html`<w3m-pay-loading-view></w3m-pay-loading-view>`)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(1)
    expect(PayController.fetchQuoteStatus).toHaveBeenCalledWith({
      requestId: 'test-request-id'
    })

    vi.advanceTimersByTime(3000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(2)
  })

  test('should stop polling when reaching terminal state (success)', async () => {
    await fixture<W3mPayLoadingView>(html`<w3m-pay-loading-view></w3m-pay-loading-view>`)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTime(3000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(2)

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'success'
    })

    const callback = subscribeKeyCallbacks.get('quoteStatus')

    if (callback) {
      callback('success')
    }

    await vi.advanceTimersByTime(10000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(2)
  })

  test('should stop polling when reaching terminal state (failure)', async () => {
    await fixture<W3mPayLoadingView>(html`<w3m-pay-loading-view></w3m-pay-loading-view>`)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTime(3000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(2)

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'failure'
    })

    const callback = subscribeKeyCallbacks.get('quoteStatus')

    if (callback) {
      callback('failure')
    }

    await vi.advanceTimersByTime(10000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(2)
  })

  test('should stop polling when requestId is not present', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      requestId: undefined
    })

    await fixture<W3mPayLoadingView>(html`<w3m-pay-loading-view></w3m-pay-loading-view>`)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(0)

    await vi.advanceTimersByTime(10000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(0)
  })

  test('should stop polling on component disconnect', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(1)

    element.remove()

    vi.advanceTimersByTime(10000)

    expect(PayController.fetchQuoteStatus).toHaveBeenCalledTimes(1)
  })

  test('should update UI when quoteStatus changes via subscription', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'waiting'
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    let pulse = element.shadowRoot?.querySelector('wui-pulse')

    expect(pulse).not.toBeNull()

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quoteStatus: 'success'
    })

    const callback = subscribeKeyCallbacks.get('quoteStatus')

    if (callback) {
      callback('success')
    }

    await elementUpdated(element)

    const successIcon = element.shadowRoot?.querySelector(
      '.token-image.success wui-icon[name="checkmark"]'
    )

    expect(successIcon).not.toBeNull()

    pulse = element.shadowRoot?.querySelector('wui-pulse')

    expect(pulse).toBeNull()
  })

  test('should update UI when quote changes via subscription', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const newQuote = { ...mockQuote, timeInSeconds: 60 }

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quote: newQuote
    })

    const callback = subscribeKeyCallbacks.get('quote')

    if (callback) {
      callback(newQuote)
    }

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const timeText = texts.find(el => el.textContent?.trim().includes('Est. 60 sec'))

    expect(timeText).toBeDefined()
  })

  test('should update UI when selectedExchange changes via subscription', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      selectedExchange: mockExchange
    })

    const callback = subscribeKeyCallbacks.get('selectedExchange')

    if (callback) {
      callback(mockExchange)
    }

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const exchangeName = texts.find(el => el.textContent?.trim() === 'Mock Exchange')

    expect(exchangeName).toBeDefined()
  })

  test('should update UI when account data changes', async () => {
    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    if (subscribeChainPropCallback) {
      subscribeChainPropCallback({
        currentTab: 0,
        caipAddress: 'eip155:1:0x9876543210987654321098765432109876543210' as CaipAddress,
        profileName: 'New User',
        addressLabels: new Map()
      })
    }

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const profileName = texts.find(el => el.textContent?.trim().includes('New User'))

    expect(profileName).toBeDefined()
  })

  test('should handle missing quote gracefully', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      quote: undefined
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    expect(element).toBeDefined()

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const timeText = texts.find(el => el.textContent?.trim().includes('Est. 0 sec'))

    expect(timeText).toBeDefined()
  })

  test('should handle missing payment asset metadata gracefully', async () => {
    vi.spyOn(PayController, 'state', 'get').mockReturnValue({
      ...PayController.state,
      paymentAsset: {
        network: 'eip155:1',
        asset: '0x0000000000000000000000000000000000000000',
        metadata: {
          name: 'Unknown Token',
          symbol: undefined as unknown as string,
          decimals: 18
        }
      }
    })

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    const texts = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || [])
    const unknownText = texts.find(el => el.textContent?.trim().includes('Unknown'))

    expect(unknownText).toBeDefined()
  })

  test('should handle missing account data', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)

    const element = await fixture<W3mPayLoadingView>(
      html`<w3m-pay-loading-view></w3m-pay-loading-view>`
    )

    await elementUpdated(element)

    expect(element).toBeDefined()
  })
})
