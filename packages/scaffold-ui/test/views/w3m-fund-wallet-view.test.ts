import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController, OptionsController, RouterController } from '@reown/appkit-controllers'

import { W3mFundWalletView } from '../../src/views/w3m-fund-wallet-view'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const DEPOSIT_FROM_EXCHANGE_BUTTON_TEST_ID = 'wallet-features-deposit-from-exchange-button'

describe('W3mFundWalletView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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
      activeChain: CommonConstantsUtil.CHAIN.EVM
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
})
