import { expect as expectChai, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Address, Hex } from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  type ChainControllerState,
  RouterController,
  SwapController,
  type SwapControllerState,
  type SwapTokenWithBalance
} from '@reown/appkit-controllers'

import { W3mSwapPreviewView } from '../../src/views/w3m-swap-preview-view/index.js'

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

const mockSwapState: SwapControllerState = {
  initializing: false,
  initialized: true,
  loadingQuote: false,
  loadingPrices: false,
  loadingTransaction: false,
  loadingApprovalTransaction: false,
  loadingBuildTransaction: false,
  fetchError: false,
  switchingTokens: false,
  approvalTransaction: undefined,
  swapTransaction: {
    data: '0x123',
    to: '0x456',
    gas: BigInt(21000),
    gasPrice: BigInt(1000000000),
    value: BigInt(0),
    toAmount: '10'
  },
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
}

const mockAccountState: AccountState = {
  balanceSymbol: 'ETH',
  address: '0x123',
  currentTab: 0,
  addressLabels: new Map()
}

describe('W3mSwapPreviewView', () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = '0px'
      readonly thresholds: ReadonlyArray<number> = [0]

      constructor(private callback: IntersectionObserverCallback) {}

      observe() {
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
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(mockChainState)
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(mockAccountState)
    vi.spyOn(SwapController, 'getTransaction').mockImplementation(
      async () => mockSwapState.swapTransaction
    )
    vi.spyOn(SwapController, 'sendTransactionForApproval').mockImplementation(async () => undefined)
    vi.spyOn(SwapController, 'sendTransactionForSwap').mockImplementation(async () => undefined)
    vi.spyOn(RouterController, 'goBack').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render initial state with token details', async () => {
    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    await element.updateComplete

    const tokenButtons = element.shadowRoot?.querySelectorAll('wui-token-button')
    expectChai(tokenButtons?.length).to.equal(2)

    const sourceTokenButton = tokenButtons?.[0]
    expectChai(sourceTokenButton?.getAttribute('text')).to.include('TEST')
    expectChai(sourceTokenButton?.getAttribute('imageSrc')).to.equal(mockToken.logoUri)

    const toTokenButton = tokenButtons?.[1]
    expectChai(toTokenButton?.getAttribute('text')).to.include('USDT')
  })

  it('should handle approval transaction', async () => {
    const approvalTransaction = {
      data: '0x789' as Hex,
      to: '0xabc' as Address,
      gas: BigInt(21000),
      gasPrice: BigInt(1000000000),
      value: BigInt(0),
      toAmount: '10'
    }

    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...mockSwapState,
      approvalTransaction
    })

    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector('.action-button') as HTMLElement
    expectChai(actionButton?.textContent?.trim()).to.include('Approve')

    await actionButton?.click()
    await element.updateComplete

    expect(SwapController.sendTransactionForApproval).toHaveBeenCalledWith(approvalTransaction)
  })

  it('should handle swap transaction', async () => {
    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector('.action-button') as HTMLElement
    expectChai(actionButton?.textContent?.trim()).to.include('Swap')

    await actionButton?.click()
    await element.updateComplete

    expect(SwapController.sendTransactionForSwap).toHaveBeenCalledWith(
      mockSwapState.swapTransaction
    )
  })

  it('should handle cancel action', async () => {
    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    await element.updateComplete

    const cancelButton = element.shadowRoot?.querySelector('.cancel-button') as HTMLElement
    await cancelButton?.click()
    await element.updateComplete

    expect(RouterController.goBack).toHaveBeenCalled()
  })

  it('should show loading state', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...mockSwapState,
      loadingTransaction: true
    })

    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    await element.updateComplete

    const actionButton = element.shadowRoot?.querySelector('.action-button')
    expectChai(actionButton?.hasAttribute('loading')).to.be.true
    expectChai(actionButton?.hasAttribute('disabled')).to.be.true
  })

  it('should cleanup interval on disconnect', async () => {
    const element = await fixture<W3mSwapPreviewView>(
      html`<w3m-swap-preview-view></w3m-swap-preview-view>`
    )

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    element.disconnectedCallback()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
