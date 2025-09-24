import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi, expect as vitestExpect } from 'vitest'

import type { CaipAddress, CaipNetwork } from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  type ChainControllerState,
  RouterController,
  SwapController,
  type SwapTokenWithBalance
} from '@reown/appkit-controllers'
import { EventsController } from '@reown/appkit-controllers'

import { W3mSwapView } from '../../src/views/w3m-swap-view'

const mockToken: SwapTokenWithBalance = {
  address: 'eip155:1:0x123',
  symbol: 'TEST',
  name: 'Test Token',
  quantity: {
    numeric: '100',
    decimals: '18'
  },
  decimals: 18,
  logoUri: 'https://example.com/icon.png',
  price: 10,
  value: 1000
}

const mockChainState: ChainControllerState = {
  activeChain: 'eip155',
  activeCaipNetwork: {
    id: 1,
    name: 'Ethereum',
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:1',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://ethereum.rpc.com']
      }
    }
  },
  activeCaipAddress: 'eip155:1:0x123456789abcdef123456789abcdef123456789a',
  chains: new Map(),
  universalAdapter: {
    networkControllerClient: {
      switchCaipNetwork: vi.fn(),
      getApprovedCaipNetworksData: vi.fn()
    },
    connectionControllerClient: {
      connectWalletConnect: vi.fn(),
      connectExternal: vi.fn(),
      reconnectExternal: vi.fn(),
      checkInstalled: vi.fn(),
      disconnect: vi.fn(),
      disconnectConnector: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
      estimateGas: vi.fn(),
      parseUnits: vi.fn(),
      formatUnits: vi.fn(),
      writeContract: vi.fn(),
      getEnsAddress: vi.fn(),
      getEnsAvatar: vi.fn(),
      grantPermissions: vi.fn(),
      revokePermissions: vi.fn(),
      getCapabilities: vi.fn(),
      walletGetAssets: vi.fn(),
      updateBalance: vi.fn()
    }
  },
  noAdapters: false,
  isSwitchingNamespace: false
}

describe('W3mSwapView', () => {
  beforeEach(() => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      initializing: false,
      initialized: true,
      loadingQuote: false,
      loadingPrices: false,
      loadingTransaction: false,
      loadingApprovalTransaction: false,
      loadingBuildTransaction: false,
      switchingTokens: false,
      fetchError: false,
      approvalTransaction: undefined,
      swapTransaction: undefined,
      transactionError: undefined,
      sourceToken: mockToken,
      sourceTokenAmount: '1',
      sourceTokenPriceInUSD: 10,
      toToken: { ...mockToken, symbol: 'USDT' },
      toTokenAmount: '10',
      toTokenPriceInUSD: 1,
      networkPrice: '0',
      networkBalanceInUSD: '0',
      networkTokenSymbol: '',
      inputError: undefined,
      slippage: 0.5,
      tokens: [
        mockToken,
        Object.assign({}, mockToken, { symbol: 'AAAA' }),
        Object.assign({}, mockToken, { symbol: 'BBBB' })
      ],
      suggestedTokens: undefined,
      popularTokens: undefined,
      foundTokens: undefined,
      myTokensWithBalance: [mockToken],
      tokensPriceMap: {},
      gasFee: '0',
      gasPriceInUSD: 2,
      priceImpact: undefined,
      maxSlippage: undefined,
      providerFee: undefined
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(mockChainState)
    vi.spyOn(SwapController, 'initializeState').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'getNetworkTokenPrice').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'getMyTokensWithBalance').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'swapTokens').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'switchTokens').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'resetState').mockImplementation(() => {})
    vi.spyOn(SwapController, 'setSourceToken').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'setToToken').mockImplementation(async () => {})
    vi.spyOn(SwapController, 'setSourceTokenAmount').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      caipAddress: 'eip155:1:0x123456789abcdef123456789abcdef123456789a',
      address: '0x123456789abcdef123456789abcdef123456789a'
    } as unknown as AccountState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render initial state with token details', async () => {
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const swapInputs = element.shadowRoot?.querySelectorAll('w3m-swap-input')
    expect(swapInputs?.length).to.equal(2)

    const sourceInput = swapInputs?.[0]
    expect(sourceInput?.value).to.equal('1')
    expect(sourceInput?.target).to.equal('sourceToken')

    const toInput = swapInputs?.[1]
    expect(toInput?.value).to.equal('10')
    expect(toInput?.target).to.equal('toToken')
  })

  it('should handle token switching', async () => {
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const switchTokensSpy = vi.spyOn(SwapController, 'switchTokens')
    const switchButton = element.shadowRoot?.querySelector(
      'wui-flex.replace-tokens-button-container wui-icon-box'
    ) as HTMLElement
    switchButton?.click()

    expect(switchTokensSpy.mock.calls.length).to.equal(1)
  })

  it('should show loading state when initializing', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      initialized: false
    })

    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const skeletons = element.shadowRoot?.querySelectorAll('w3m-swap-input-skeleton')
    expect(skeletons?.length).to.equal(2)
  })

  it('should handle swap preview navigation', async () => {
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const routerPushSpy = vi.spyOn(RouterController, 'push')
    const actionButton = element.shadowRoot?.querySelector(
      '[data-testid="swap-action-button"]'
    ) as HTMLElement
    actionButton?.click()

    expect(routerPushSpy.mock.calls[0]?.[0]).to.equal('SwapPreview')
  })

  it('should show error state in action button', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      inputError: 'Insufficient balance'
    })

    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector('[data-testid="swap-action-button"]')
    expect(actionButton?.textContent?.trim()).to.equal('Insufficient balance')
  })

  it('should handle loading states', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      loadingQuote: true
    })

    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector('wui-button')
    expect(actionButton?.loading).to.be.true
  })

  it('should cleanup on disconnect', async () => {
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    element.disconnectedCallback()

    expect(clearIntervalSpy.mock.calls.length).to.equal(1)
  })

  it('should retry swap when fetchError is true', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      fetchError: true,
      sourceToken: { ...mockToken, symbol: 'ETH' },
      toToken: { ...mockToken, symbol: 'USDT' },
      sourceTokenAmount: '1.5',
      toTokenAmount: '2000'
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockChainState.activeCaipNetwork
    })

    const swapTokensSpy = vi.spyOn(SwapController, 'swapTokens')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerPushSpy = vi.spyOn(RouterController, 'push')

    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)
    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector(
      '[data-testid="swap-action-button"]'
    ) as HTMLElement

    await actionButton?.click()

    expect(swapTokensSpy.mock.calls.length).to.equal(1)

    expect(sendEventSpy.mock.calls.length).to.equal(1)
    expect(sendEventSpy.mock.calls[0]?.[0]).to.deep.equal({
      type: 'track',
      event: 'INITIATE_SWAP',
      properties: {
        network: 'eip155:1',
        swapFromToken: 'ETH',
        swapToToken: 'USDT',
        swapFromAmount: '1.5',
        swapToAmount: '2000',
        isSmartAccount: false
      }
    })
    expect(routerPushSpy.mock.calls.length).to.equal(1)
    expect(routerPushSpy.mock.calls[0]?.[0]).to.equal('SwapPreview')
  })

  it('should handle caipAddress change', async () => {
    vi.mocked(SwapController.resetState).mockClear()
    vi.mocked(SwapController.initializeState).mockClear()

    const subscribeChainPropSpy = vi.spyOn(ChainController, 'subscribeChainProp')

    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)
    await element.updateComplete

    expect(subscribeChainPropSpy.mock.calls.length).to.be.greaterThan(0)

    // Ensure we registered for 'accountState' updates
    const accountStateCallback = subscribeChainPropSpy.mock.calls.find(
      call => call[0] === 'accountState'
    )?.[1] as ((val: Partial<AccountState>) => void) | undefined

    expect(Boolean(accountStateCallback)).to.be.true

    // Test 1: Same caipAddress should not trigger resets
    const currentCaipAddress = 'eip155:1:0x123456789abcdef123456789abcdef123456789a'
    vi.mocked(SwapController.resetState).mockClear()
    vi.mocked(SwapController.initializeState).mockClear()

    accountStateCallback?.({ caipAddress: currentCaipAddress })

    expect(vi.mocked(SwapController.resetState).mock.calls.length).to.equal(0)
    expect(vi.mocked(SwapController.initializeState).mock.calls.length).to.equal(0)

    // Test 2: Different caipAddress should trigger reset
    vi.mocked(SwapController.resetState).mockClear()
    vi.mocked(SwapController.initializeState).mockClear()

    const newCaipAddress = 'eip155:1:0xabcdef123456789abcdef123456789abcdef1234'
    accountStateCallback?.({ caipAddress: newCaipAddress })

    expect(vi.mocked(SwapController.resetState).mock.calls.length).to.equal(1)
    expect(vi.mocked(SwapController.initializeState).mock.calls.length).to.equal(0)
  })

  it('should set initial state with preselected tokens', async () => {
    const element = await fixture<W3mSwapView>(
      html`<w3m-swap-view
        .initialParams=${{ fromToken: 'AAAA', toToken: 'BBBB', amount: '321.123' }}
      ></w3m-swap-view>`
    )

    await element.updateComplete

    vitestExpect(SwapController.setSourceToken).toHaveBeenCalledWith(
      vitestExpect.objectContaining({
        symbol: 'AAAA'
      })
    )
    vitestExpect(SwapController.setToToken).toHaveBeenCalledWith(
      vitestExpect.objectContaining({
        symbol: 'BBBB'
      })
    )
    vitestExpect(SwapController.setSourceTokenAmount).toHaveBeenCalledWith('321.123')
  })

  it('should call unsubscribe when unmounted', async () => {
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)
    await element.updateComplete

    const unsubscribeSpies = element['unsubscribe'].map(unsubscribe => {
      return vi.fn(unsubscribe)
    })

    element['unsubscribe'] = unsubscribeSpies

    element.disconnectedCallback()

    // Verify each unsubscribe function was called
    unsubscribeSpies.forEach(spy => {
      expect(spy.mock.calls.length).to.equal(1)
    })
  })

  it('should still react to network and address change events after being unmounted', async () => {
    const resetStateSpy = vi.spyOn(SwapController, 'resetState')
    const initializeStateSpy = vi.spyOn(SwapController, 'initializeState')

    const subscribeKeySpy = vi.spyOn(ChainController, 'subscribeKey')
    const subscribeChainPropSpy = vi.spyOn(ChainController, 'subscribeChainProp')

    const element: W3mSwapView = await fixture(html`<w3m-swap-view></w3m-swap-view>`)
    await element.updateComplete

    const chainCallbacks = subscribeKeySpy.mock.calls
      .filter(call => call[0] === 'activeCaipNetwork')
      .map(call => call[1])
    const accountCallbacks = subscribeChainPropSpy.mock.calls
      .filter(call => call[0] === 'accountState')
      .map(call => call[1])

    vitestExpect(chainCallbacks.length).toBe(1)
    vitestExpect(accountCallbacks.length).toBe(1)

    element.disconnectedCallback()

    resetStateSpy.mockClear()
    initializeStateSpy.mockClear()

    const mockNetwork = {
      id: 2,
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:2'
    } as unknown as CaipNetwork

    chainCallbacks[0]?.(mockNetwork)
    accountCallbacks[0]?.('eip155:2:0x456' as CaipAddress)

    vitestExpect(resetStateSpy).toHaveBeenCalled()
    vitestExpect(initializeStateSpy).not.toHaveBeenCalled()
  })

  it('should call handleChangeAmount with max value when setting max value', async () => {
    vi.useFakeTimers()
    const swapTokensSpy = vi.spyOn(SwapController, 'swapTokens')
    const element = await fixture<W3mSwapView>(html`<w3m-swap-view></w3m-swap-view>`)
    await element.updateComplete

    const handleChangeAmountSpy = vi.spyOn(element as any, 'handleChangeAmount')

    // Call onSetMaxValue directly since it's the method used by the max button
    element['onSetMaxValue']('sourceToken', '100')

    vitestExpect(handleChangeAmountSpy).toHaveBeenCalledWith(
      'sourceToken',
      '100.00000000000000000000'
    )

    // Wait for debounce timeout
    await vi.advanceTimersByTime(200)

    vitestExpect(swapTokensSpy).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
