import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'

import { W3mAccountWalletFeaturesWidget } from '../../src/partials/w3m-account-wallet-features-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const WALLET_FEATURE_WIDGET_TEST_ID = 'w3m-account-wallet-features-widget'
const WALLET_SWITCH_TEST_ID = 'wui-wallet-switch'
const MOCK_ADDRESS = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'

const SERVICE_UNAVAILABLE_MESSAGE = 'Service Unavailable'

const ACCOUNT = {
  namespace: 'eip155',
  address: '0x123',
  type: 'eoa'
} as const

describe('W3mAccountWalletFeaturesWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('it should not return any components if address is not provided in AccountController', () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: undefined
    })
    expect(() =>
      fixture(html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`)
    ).rejects.toThrow('w3m-account-view: No account provided')
  })

  it('it should return all components if address is provided in AccountsController', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: MOCK_ADDRESS
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask.io'
      } as Record<ChainNamespace, string | undefined>
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.getByTestId(element, WALLET_FEATURE_WIDGET_TEST_ID)).not.toBeNull()
  })

  it('should redirect to ProfileWallets view', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: MOCK_ADDRESS
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask.io'
      } as Record<ChainNamespace, string | undefined>
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })

    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    const walletSwitch = HelpersUtil.getByTestId(element, WALLET_SWITCH_TEST_ID)

    expect(walletSwitch).not.toBeNull()

    const button = HelpersUtil.querySelect(walletSwitch, 'button')

    button.click()

    expect(pushSpy).toHaveBeenCalledWith('ProfileWallets')
  })

  it('should show tabs for eip155 namespace', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: MOCK_ADDRESS
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)
    const tabs = HelpersUtil.querySelect(element, 'wui-tabs')
    expect(tabs).not.toBeNull()
  })

  it('should not show tabs for solana namespace', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: MOCK_ADDRESS
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.SOLANA
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)
    const tabs = HelpersUtil.querySelect(element, 'wui-tabs')
    expect(tabs).toBeNull()
  })

  it('should clearInterval when fetchTokenBalance fails after 10 seconds', async () => {
    vi.useFakeTimers()
    vi.spyOn(global, 'setInterval')
    vi.spyOn(global, 'clearInterval')
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    expect(setInterval).toHaveBeenCalled()

    const response = new Response(SERVICE_UNAVAILABLE_MESSAGE, {
      status: CommonConstantsUtil.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
    })

    const error = new Error(SERVICE_UNAVAILABLE_MESSAGE, { cause: response })

    vi.spyOn(AccountController, 'fetchTokenBalance').mockImplementation(async callback => {
      callback?.(error)
      return []
    })

    vi.advanceTimersByTime(10_000)

    expect(clearInterval).toHaveBeenCalledWith((element as any).watchTokenBalance)

    vi.useRealTimers()
    vi.restoreAllMocks()
  })
})
describe('wallet features visibility', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  describe('evm wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: CommonConstantsUtil.CHAIN.EVM
      })
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        address: MOCK_ADDRESS
      })
    })

    it('should show all features when enabled', async () => {
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

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show onramp if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: true
        },
        remoteFeatures: {
          onramp: false,
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show swaps if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: true
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: false
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show receive if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
          send: true
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show send if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: false
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })
  })

  describe('solana wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: CommonConstantsUtil.CHAIN.SOLANA
      })
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        address: MOCK_ADDRESS
      })
    })

    it('should show all features but swaps when enabled', async () => {
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

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show onramp if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: true
        },
        remoteFeatures: {
          onramp: false,
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show receive if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
          send: true
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show send if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: false
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })
  })

  describe('bitcoin wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: CommonConstantsUtil.CHAIN.BITCOIN
      })
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        address: 'bc1qa1234567890'
      })
    })

    it('should only show onramp and receive when enabled', async () => {
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

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })

    it('should not show onramp if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: true,
          send: true
        },
        remoteFeatures: {
          onramp: false,
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })

    it('should not show receive if disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
          send: true
        },
        remoteFeatures: {
          onramp: ['meld'],
          swaps: ['1inch']
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'wallet-features-onramp-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-receive-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })
  })
})
