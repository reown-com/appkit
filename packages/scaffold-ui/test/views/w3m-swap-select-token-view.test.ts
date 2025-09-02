import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import type { CaipAddress } from '@reown/appkit-common'
import {
  BlockchainApiController,
  RouterController,
  type RouterControllerState,
  SwapController,
  type SwapControllerState,
  type SwapTokenWithBalance
} from '@reown/appkit-controllers'
import { extendedMainnet, mockChainControllerState } from '@reown/appkit-controllers/testing'

import { W3mSwapSelectTokenView } from '../../src/views/w3m-swap-select-token-view'

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

const mockTokens: SwapTokenWithBalance[] = [
  mockToken,
  {
    ...mockToken,
    symbol: 'USDT',
    name: 'USD Tether',
    address: 'eip155:1:0x456' as `eip155:${string}:${string}`
  },
  {
    ...mockToken,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: 'eip155:1:0x789' as `eip155:${string}:${string}`
  }
]

const tokensResponse = {
  tokens: [
    {
      name: 'MATIC',
      symbol: 'MATIC',
      address: 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as CaipAddress,
      decimals: 18,
      logoUri: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
      eip2612: false
    },
    {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      address: 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b' as CaipAddress,
      decimals: 18,
      logoUri: 'https://tokens.1inch.io/0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b.png',
      eip2612: false
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: 'eip155:137:0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' as CaipAddress,
      decimals: 6,
      logoUri: 'https://tokens.1inch.io/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359.png',
      eip2612: false
    }
  ]
}

const mockRouterState: RouterControllerState = {
  view: 'SwapSelectToken',
  history: ['Connect', 'SwapSelectToken'],
  data: {
    target: 'sourceToken'
  },
  transactionStack: []
}

const mockSwapState: SwapControllerState = {
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
  tokens: [mockToken],
  suggestedTokens: mockTokens,
  popularTokens: mockTokens,
  foundTokens: undefined,
  myTokensWithBalance: mockTokens,
  tokensPriceMap: {},
  gasFee: '0',
  gasPriceInUSD: 2,
  priceImpact: undefined,
  maxSlippage: undefined,
  providerFee: undefined
}

describe('W3mSwapSelectTokenView', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = '0px'
      readonly thresholds: ReadonlyArray<number> = [0]

      constructor(private callback: IntersectionObserverCallback) {}

      observe() {
        // Simulate an intersection
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              target: document.createElement('div'),
              time: Date.now()
            }
          ],
          this
        )
      }

      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }

    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

    // Mock controller states and methods
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue(mockSwapState)
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue(mockRouterState)
    vi.spyOn(BlockchainApiController, 'fetchSwapTokens').mockResolvedValue(tokensResponse)

    mockChainControllerState({
      activeCaipNetwork: extendedMainnet,
      activeCaipAddress: 'eip155:1:0x123' as CaipAddress
    })
    SwapController.setBalances(mockTokens)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render initial state with token lists', async () => {
    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    await element.updateComplete

    const searchInput = element.shadowRoot?.querySelector(
      '[data-testid="swap-select-token-search-input"]'
    )
    expect(searchInput).to.exist

    const suggestedTokens = element.shadowRoot?.querySelectorAll('wui-token-button')
    expect(suggestedTokens?.length).to.equal(mockTokens.length)

    const yourTokens = element.shadowRoot?.querySelectorAll('wui-token-list-item')
    expect(yourTokens?.length).to.equal(mockTokens.length * 2)
  })

  it('should handle token search', async () => {
    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    await element.updateComplete

    const searchInput = element.shadowRoot?.querySelector(
      '[data-testid="swap-select-token-search-input"]'
    )
    searchInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'USDT' }))

    await element.updateComplete

    const tokenItems = element.shadowRoot?.querySelectorAll('wui-token-list-item')
    const visibleTokens = Array.from(tokenItems || []).filter(item => !item.hasAttribute('hidden'))

    expect(visibleTokens.length).to.be.greaterThan(0)
    visibleTokens.forEach(token => {
      expect(token.getAttribute('symbol')?.toLowerCase()).to.include('usdt')
    })
  })

  it('should select source token and go back', async () => {
    const setSourceTokenSpy = vi.spyOn(SwapController, 'setSourceToken')
    const goBackSpy = vi.spyOn(RouterController, 'goBack')

    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    await element.updateComplete

    const tokenItem = element.shadowRoot?.querySelector(
      '[data-testid="swap-select-token-item-DAI"]'
    ) as HTMLElement
    tokenItem?.click()

    expect(setSourceTokenSpy.mock.calls.length).to.equal(1)
    expect(goBackSpy.mock.calls.length).to.equal(1)
  })

  it('should select destination token and trigger swap', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...mockRouterState,
      data: {
        target: 'toToken'
      }
    })

    const setToTokenSpy = vi.spyOn(SwapController, 'setToToken')
    const swapTokensSpy = vi.spyOn(SwapController, 'swapTokens')
    const goBackSpy = vi.spyOn(RouterController, 'goBack')

    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    await element.updateComplete

    const tokenItem = element.shadowRoot?.querySelector(
      '[data-testid="swap-select-token-item-DAI"]'
    ) as HTMLElement
    tokenItem?.click()

    expect(setToTokenSpy.mock.calls.length).to.equal(1)
    expect(swapTokensSpy.mock.calls.length).to.equal(1)
    expect(goBackSpy.mock.calls.length).to.equal(1)
  })

  it('should handle scroll events', async () => {
    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    await element.updateComplete

    const suggestedTokensContainer = element.shadowRoot?.querySelector(
      '.suggested-tokens-container'
    ) as HTMLElement
    const tokensList = element.shadowRoot?.querySelector('.tokens') as HTMLElement

    suggestedTokensContainer?.dispatchEvent(new Event('scroll'))
    tokensList?.dispatchEvent(new Event('scroll'))

    expect(
      suggestedTokensContainer?.style.getPropertyValue('--suggested-tokens-scroll--left-opacity')
    ).to.exist
    expect(tokensList?.style.getPropertyValue('--tokens-scroll--top-opacity')).to.exist
  })

  it('should cleanup event listeners on disconnect', async () => {
    const element = await fixture<W3mSwapSelectTokenView>(
      html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
    )

    const removeEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener')

    element.disconnectedCallback()

    expect(removeEventListenerSpy.mock.calls.length).to.equal(2)
  })
})
