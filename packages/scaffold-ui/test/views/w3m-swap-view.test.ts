import { expect, html, fixture } from '@open-wc/testing'
import { describe, it, afterEach, beforeEach, vi } from 'vitest'
import { W3mSwapView } from '../../src/views/w3m-swap-view'
import {
  SwapController,
  RouterController,
  ChainController,
  type SwapTokenWithBalance,
  type ChainControllerState
} from '@reown/appkit-core'

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
      getCapabilities: vi.fn()
    }
  },
  noAdapters: false
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
    vi.spyOn(SwapController, 'switchTokens').mockImplementation(() => {})
    vi.spyOn(SwapController, 'resetState').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
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
      '.replace-tokens-button-container button'
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
})
