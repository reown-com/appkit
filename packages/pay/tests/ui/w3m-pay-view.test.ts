import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { PayController } from '../../src/controllers/PayController'
import { W3mPayView } from '../../src/ui/w3m-pay-view'
import { formatAmount, isPayWithWalletSupported } from '../../src/utils/AssetUtil.js'
import { mockExchanges, mockPaymentAsset, mockRequestedCaipNetworks } from '../mocks/State'

vi.mock('../../src/utils/AssetUtil.js', () => ({
  isPayWithWalletSupported: vi.fn(),
  formatAmount: vi.fn((val: string | number) => String(val)),
  isTestnetAsset: vi.fn(() => false)
}))

describe('W3mPayView', () => {
  beforeAll(() => {
    if (!customElements.get('w3m-pay-view')) {
      customElements.define('w3m-pay-view', W3mPayView)
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset PayController state
    PayController.state.isLoading = false
    PayController.state.exchanges = []
    PayController.state.paymentAsset = mockPaymentAsset
    PayController.state.amount = 10
    PayController.state.recipient = '0x1234567890123456789012345678901234567890'
    PayController.state.selectedExchange = undefined

    // Mock ChainController state
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    // Reset Account state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'disconnected',
      caipAddress: undefined,
      connectedWalletInfo: undefined,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    // Mock ChainController
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(
      mockRequestedCaipNetworks
    )
    vi.spyOn(ChainController, 'subscribeChainProp').mockReturnValue(() => {})

    // Mock ConnectorController
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: undefined,
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })
    vi.spyOn(ConnectorController, 'subscribeKey').mockReturnValue(() => {})
    vi.spyOn(ConnectorController, 'connect').mockResolvedValue({
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any
    })
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({
      id: 'metamask',
      name: 'MetaMask',
      type: 'WALLET',
      imageUrl: ''
    } as any)

    // Mock PayController methods
    vi.spyOn(PayController, 'fetchExchanges').mockImplementation(async () => {
      PayController.state.exchanges = mockExchanges
    })
    vi.spyOn(PayController, 'subscribeKey').mockReturnValue(() => {})
    vi.spyOn(PayController, 'setSelectedExchange').mockImplementation(() => {})

    // Mock RouterController
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    // Mock ConnectionController and ModalController
    vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)
    vi.spyOn(ModalController, 'open').mockResolvedValue(undefined)
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

    // Mock AssetUtil
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('')
    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('')

    vi.mocked(isPayWithWalletSupported).mockReturnValue(true)
    vi.mocked(formatAmount).mockImplementation((val: string | number) => String(val))
  })

  test('should render payment header with correct amount and token', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const amountText = element.shadowRoot?.querySelector('wui-text[variant="h1-regular"]')
    const tokenText = element.shadowRoot?.querySelector('wui-text[variant="h6-regular"]')
    const networkText = element.shadowRoot?.querySelector('wui-text[variant="md-medium"]')

    expect(amountText?.textContent?.trim()).toBe('10')
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
    expect(disconnectedView?.querySelector('wui-text')?.textContent).toBe('Pay with wallet')
  })

  test('should render connected wallet view when connected', async () => {
    // Mock connected state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

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

    const spinner = element.shadowRoot?.querySelector('wui-loading-spinner')
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

  test('should connect wallet when disconnected wallet payment option is clicked', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const walletPaymentOption = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    ) as HTMLElement
    walletPaymentOption?.click()

    await elementUpdated(element)

    expect(ConnectorController.connect).toHaveBeenCalledOnce()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'PayQuote' })
  })

  test('should set selected exchange and navigate when exchange option is clicked', async () => {
    // Populate exchanges
    PayController.state.exchanges = mockExchanges

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const coinbaseOption = element.shadowRoot?.querySelector(
      '[data-testid="exchange-option-coinbase"]'
    ) as HTMLElement
    coinbaseOption?.click()

    await elementUpdated(element)

    expect(PayController.setSelectedExchange).toHaveBeenCalledWith(mockExchanges[0])
    expect(RouterController.push).toHaveBeenCalledWith('PayQuote')
  })

  test('should disconnect wallet when disconnect button is clicked', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const disconnectButton = element.shadowRoot?.querySelector(
      '[data-testid="disconnect-button"]'
    ) as HTMLElement
    disconnectButton?.click()

    await elementUpdated(element)

    expect(ConnectionController.disconnect).toHaveBeenCalledOnce()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'Pay' })
  })

  test('should show error snackbar if disconnection fails', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

    vi.mocked(ConnectionController.disconnect).mockRejectedValueOnce(new Error('Disconnect failed'))

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const disconnectButton = element.shadowRoot?.querySelector(
      '[data-testid="disconnect-button"]'
    ) as HTMLElement
    disconnectButton?.click()

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

  test('should navigate to PayQuote when connected wallet payment option is clicked', async () => {
    // Mock connected state
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    await elementUpdated(element)

    const connectedView = element.shadowRoot?.querySelector(
      '[data-testid="wallet-payment-option"]'
    ) as HTMLElement
    connectedView?.click()

    await elementUpdated(element)

    expect(RouterController.push).toHaveBeenCalledWith('PayQuote')
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

    expect(walletPaymentOption).toBeNull()
  })

  test('should call formatAmount with correct value', async () => {
    PayController.state.amount = 123.456

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(formatAmount).toHaveBeenCalledWith(123.456)
  })

  test('should initialize and set selectedExchange to undefined', async () => {
    await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)

    expect(PayController.setSelectedExchange).toHaveBeenCalledWith(undefined)
    expect(PayController.fetchExchanges).toHaveBeenCalled()
  })

  test('should render token and network images', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const images = element.shadowRoot?.querySelectorAll('wui-image')
    expect(images?.length).toBeGreaterThanOrEqual(2)
  })

  test('should render separator with "or" text', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const separator = element.shadowRoot?.querySelector('wui-separator')
    expect(separator).not.toBeNull()
    expect(separator?.getAttribute('text')).toBe('or')
  })

  test('should subscribe to active chain and update caipAddress', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(ChainController.subscribeChainProp).toHaveBeenCalledWith(
      'accountState',
      expect.any(Function),
      'eip155'
    )
  })

  test('should subscribe to PayController amount changes', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(PayController.subscribeKey).toHaveBeenCalledWith('amount', expect.any(Function))
  })

  test('should subscribe to PayController exchanges changes', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(PayController.subscribeKey).toHaveBeenCalledWith('exchanges', expect.any(Function))
  })

  test('should subscribe to PayController isLoading changes', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(PayController.subscribeKey).toHaveBeenCalledWith('isLoading', expect.any(Function))
  })

  test('should subscribe to ConnectorController activeConnectorIds changes', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(ConnectorController.subscribeKey).toHaveBeenCalledWith(
      'activeConnectorIds',
      expect.any(Function)
    )
  })

  test('should get connector properties when rendering connected wallet', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    expect(ConnectorController.getConnector).toHaveBeenCalledWith({
      id: 'metamask',
      namespace: 'eip155'
    })
    expect(AssetUtil.getConnectorImage).toHaveBeenCalled()
  })

  test('should render list items with correct properties', async () => {
    PayController.state.exchanges = mockExchanges

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const listItems = element.shadowRoot?.querySelectorAll('wui-list-item')
    expect(listItems?.length).toBeGreaterThan(0)

    const firstExchangeOption = element.shadowRoot?.querySelector(
      '[data-testid="exchange-option-coinbase"]'
    ) as any
    expect(firstExchangeOption?.getAttribute('type')).toBe('secondary')
  })

  test('should handle missing connector gracefully', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      status: 'connected',
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890' as any,
      currentTab: 0,
      addressLabels: new Map(),
      tokenBalance: [],
      smartAccountDeployed: false
    } as AccountState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'unknown-connector',
        solana: undefined,
        polkadot: undefined,
        bip122: undefined,
        cosmos: undefined,
        ton: undefined,
        sui: undefined,
        stacks: undefined
      }
    })

    vi.mocked(ConnectorController.getConnector).mockReturnValue(undefined)

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const connectedView = element.shadowRoot?.querySelector('[data-testid="wallet-payment-option"]')
    expect(connectedView).not.toBeNull()
  })

  test('should render correct network name from caipNetwork', async () => {
    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const networkText = element.shadowRoot?.querySelector('wui-text[variant="md-medium"]')
    expect(networkText?.textContent).toContain('Ethereum')
  })

  test('should display "Unknown" when network is not found', async () => {
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([])

    const element = await fixture<W3mPayView>(html`<w3m-pay-view></w3m-pay-view>`)
    await elementUpdated(element)

    const networkText = element.shadowRoot?.querySelector('wui-text[variant="md-medium"]')
    expect(networkText?.textContent).toContain('Unknown')
  })
})
