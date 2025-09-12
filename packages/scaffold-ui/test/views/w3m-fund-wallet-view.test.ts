import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ExchangeController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'

import { W3mFundWalletView } from '../../src/views/w3m-fund-wallet-view'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID = 'wallet-features-deposit-from-exchange-button'

describe('W3mFundWalletView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([])
    vi.spyOn(ExchangeController, 'setPaymentAsset').mockImplementation(() => {})
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with basic structure', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true,
        send: true
      },
      remoteFeatures: {
        onramp: ['meld'],
        swaps: ['1inch']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    expect(element).toBeDefined()
    expect(element.shadowRoot).toBeDefined()
  })

  it('should show buy crypto option when onramp is available', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: {
        id: '1',
        caipNetworkId: 'eip155:1' as const,
        chainNamespace: 'eip155',
        name: 'Mainnet'
      } as unknown as CaipNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true
      },
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const buyCryptoButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-onramp-button"]'
    )
    expect(buyCryptoButton).toBeTruthy()
  })

  it('should show receive funds option when receive feature is enabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true
      },
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const receiveFundsButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-receive-button"]'
    )
    expect(receiveFundsButton).toBeTruthy()
  })

  it('should navigate to buy crypto when buy crypto button is clicked', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push')

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: {
        id: '1',
        caipNetworkId: 'eip155:1' as const,
        chainNamespace: 'eip155',
        name: 'Mainnet'
      } as unknown as CaipNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true
      },
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const buyCryptoButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-onramp-button"]'
    )
    expect(buyCryptoButton).toBeTruthy()

    buyCryptoButton?.click()
    await elementUpdated(element)

    expect(pushSpy).toHaveBeenCalledWith('OnRampProviders')
  })

  it('should navigate to receive funds when receive funds button is clicked', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push')

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true
      },
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const receiveFundsButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-receive-button"]'
    )
    expect(receiveFundsButton).toBeTruthy()

    receiveFundsButton?.click()
    await elementUpdated(element)

    expect(pushSpy).toHaveBeenCalledWith('WalletReceive')
  })

  it('should hide buy crypto option when onramp is not available', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: true
      },
      remoteFeatures: {
        onramp: false
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const buyCryptoButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-onramp-button"]'
    )
    expect(buyCryptoButton).toBeFalsy()
  })

  it('should hide receive funds option when receive feature is disabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        receive: false
      },
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const receiveFundsButton = HelpersUtil.querySelect(
      element,
      '[data-testid="wallet-features-receive-button"]'
    )
    expect(receiveFundsButton).toBeFalsy()
  })

  it('should not show deposit from exchange option when payWithExchange is disabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: false
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )

    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )
    expect(depositFromExchangeButton).toBeFalsy()
  })

  it('should show deposit from exchange option when payWithExchange is enabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: {
        id: '1',
        caipNetworkId: 'eip155:1' as const,
        chainNamespace: 'eip155',
        name: 'Mainnet'
      } as unknown as CaipNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )

    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )

    expect(depositFromExchangeButton).toBeTruthy()
  })

  it('should not show deposit from exchange option when chain is not supported and payWithExchange is enabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.BITCOIN
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )

    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )

    expect(depositFromExchangeButton).toBeNull()
  })

  it('should fetch exchanges and set default payment asset on first update', async () => {
    const mockNetwork = {
      id: '1',
      caipNetworkId: 'eip155:1' as const,
      chainNamespace: 'eip155',
      name: 'Mainnet'
    } as unknown as CaipNetwork

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    const getAssetsForNetworkSpy = vi
      .spyOn(ExchangeController, 'getAssetsForNetwork')
      .mockResolvedValue([
        {
          network: 'eip155:1',
          asset: 'native',
          price: 1,
          metadata: {
            iconUrl: 'https://img.solana.com/solana-logo-full.svg',
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          }
        }
      ])
    const setPaymentAssetSpy = vi.spyOn(ExchangeController, 'setPaymentAsset')
    const fetchExchangesSpy = vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    await fixture(html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`)

    expect(getAssetsForNetworkSpy).toHaveBeenCalledWith('eip155:1')
    expect(setPaymentAssetSpy).toHaveBeenCalled()
    expect(fetchExchangesSpy).toHaveBeenCalled()
  })

  it('should disable deposit from exchange button when no exchanges available', async () => {
    const mockNetwork = {
      id: '1',
      caipNetworkId: 'eip155:1' as const,
      chainNamespace: 'eip155',
      name: 'Mainnet'
    } as unknown as CaipNetwork

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    // Mock state with no exchanges
    ExchangeController.state.exchanges = []
    ExchangeController.state.isLoading = false

    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([])
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )

    expect(depositFromExchangeButton).toBeTruthy()
    expect(depositFromExchangeButton?.hasAttribute('disabled')).toBe(true)
  })

  it('should show loading state on deposit from exchange button while fetching exchanges', async () => {
    const mockNetwork = {
      id: '1',
      caipNetworkId: 'eip155:1' as const,
      chainNamespace: 'eip155',
      name: 'Mainnet'
    } as unknown as CaipNetwork

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    // Mock loading state
    ExchangeController.state.isLoading = true
    ExchangeController.state.exchanges = []

    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([])
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )

    expect(depositFromExchangeButton).toBeTruthy()
    expect(depositFromExchangeButton?.hasAttribute('loading')).toBe(true)
  })

  it('should navigate to PayWithExchange when deposit from exchange button is clicked', async () => {
    const mockNetwork = {
      id: '1',
      caipNetworkId: 'eip155:1' as const,
      chainNamespace: 'eip155',
      name: 'Mainnet'
    } as unknown as CaipNetwork

    const pushSpy = vi.spyOn(RouterController, 'push')

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockNetwork
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        payWithExchange: true
      }
    })

    // Mock state with available exchanges
    ExchangeController.state.exchanges = [
      { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' }
    ] as any
    ExchangeController.state.isLoading = false

    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([])
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mFundWalletView = await fixture(
      html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`
    )
    await elementUpdated(element)

    const depositFromExchangeButton = HelpersUtil.getByTestId(
      element,
      DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID
    )

    expect(depositFromExchangeButton).toBeTruthy()
    expect(depositFromExchangeButton?.hasAttribute('disabled')).toBe(false)

    depositFromExchangeButton?.click()
    await elementUpdated(element)

    expect(pushSpy).toHaveBeenCalledWith('PayWithExchange', {
      redirectView: undefined
    })
  })
})
