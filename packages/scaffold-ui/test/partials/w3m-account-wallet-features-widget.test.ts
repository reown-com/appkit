import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil
} from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  type ChainControllerState,
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

// --- Helpers ---------------------------------------------------- //
function createMockChainState(
  chainNamespace: string,
  caipNetworkId?: string
): ChainControllerState {
  const mockCaipNetwork = caipNetworkId
    ? {
        id: caipNetworkId.split(':')[1],
        chainNamespace,
        caipNetworkId,
        name: 'Test Network',
        nativeCurrency: {
          name: 'Test Token',
          symbol: 'TEST',
          decimals: 18
        },
        rpcUrls: {
          default: { http: ['https://test.rpc'] }
        },
        blockExplorers: {
          default: { name: 'Test Explorer', url: 'https://test.explorer' }
        }
      }
    : undefined

  return {
    ...ChainController.state,
    activeChain: chainNamespace as ChainNamespace,
    activeCaipNetwork: mockCaipNetwork as CaipNetwork,
    activeCaipAddress: mockCaipNetwork
      ? (`${mockCaipNetwork.caipNetworkId}:${MOCK_ADDRESS}` as CaipAddress)
      : undefined
  }
}

const ACCOUNT = {
  namespace: 'eip155',
  address: '0x123',
  type: 'eoa'
} as const

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('W3mAccountWalletFeaturesWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock fetchTokenBalance to prevent network calls and "is not a function" errors
    vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValue([])
  })

  it('it should not return any components if address is not provided in ChainController', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: undefined
    } as unknown as AccountState)
    await expect(() =>
      fixture(html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`)
    ).rejects.toThrow('w3m-account-features-widget: No account provided')
  })

  it('it should return all components if address is provided in AccountsController', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS
    } as unknown as AccountState)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask.io'
      } as Record<ChainNamespace, string | undefined>
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      createMockChainState(CommonConstantsUtil.CHAIN.EVM, 'eip155:1')
    )

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.getByTestId(element, WALLET_FEATURE_WIDGET_TEST_ID)).not.toBeNull()
  })

  it('should redirect to ProfileWallets view', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS
    } as unknown as AccountState)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        eip155: 'metamask.io'
      } as Record<ChainNamespace, string | undefined>
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      createMockChainState(CommonConstantsUtil.CHAIN.EVM, 'eip155:1')
    )

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
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS
    } as unknown as AccountState)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      createMockChainState(CommonConstantsUtil.CHAIN.EVM, 'eip155:1')
    )

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)
    const tabs = HelpersUtil.querySelect(element, 'wui-tabs')
    expect(tabs).not.toBeNull()
  })

  it('should not show tabs for solana namespace', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS
    } as unknown as AccountState)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      createMockChainState(CommonConstantsUtil.CHAIN.SOLANA, 'solana:mainnet')
    )

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
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: ACCOUNT.address
    } as unknown as AccountState)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      createMockChainState(CommonConstantsUtil.CHAIN.EVM, 'eip155:1')
    )

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    expect(setInterval).toHaveBeenCalled()

    const response = new Response(SERVICE_UNAVAILABLE_MESSAGE, {
      status: CommonConstantsUtil.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
    })

    const error = new Error(SERVICE_UNAVAILABLE_MESSAGE, { cause: response })

    vi.spyOn(ChainController, 'fetchTokenBalance').mockImplementation(async callback => {
      callback?.(error)
      return []
    })

    vi.advanceTimersByTime(10_000)

    expect(clearInterval).toHaveBeenCalledWith((element as any).watchTokenBalance)

    vi.useRealTimers()
    vi.restoreAllMocks()
  })
})

describe('list content template', () => {
  beforeAll(() => {
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock fetchTokenBalance to prevent network calls and "is not a function" errors
    vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValue([])
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: CommonConstantsUtil.CHAIN.EVM
    })
  })

  it('renders tokens widget when currentTab is 0', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS,
      currentTab: 0,
      addressLabels: new Map()
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)

    const tokens = HelpersUtil.querySelect(element, 'w3m-account-tokens-widget')
    const activity = HelpersUtil.querySelect(element, 'w3m-account-activity-widget')

    expect(tokens).not.toBeNull()
    expect(activity).toBeNull()
  })

  it('renders activity widget when currentTab is 1', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS,
      currentTab: 1,
      addressLabels: new Map()
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)

    const tokens = HelpersUtil.querySelect(element, 'w3m-account-tokens-widget')
    const activity = HelpersUtil.querySelect(element, 'w3m-account-activity-widget')

    expect(tokens).toBeNull()
    expect(activity).not.toBeNull()
  })

  it('falls back to tokens widget for any other currentTab value', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: MOCK_ADDRESS,
      currentTab: 2,
      addressLabels: new Map()
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    await elementUpdated(element)

    const tokens = HelpersUtil.querySelect(element, 'w3m-account-tokens-widget')
    const activity = HelpersUtil.querySelect(element, 'w3m-account-activity-widget')

    expect(tokens).not.toBeNull()
    expect(activity).toBeNull()
  })
})

describe('wallet features visibility', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock fetchTokenBalance to prevent network calls and "is not a function" errors
    vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  describe('evm wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
        createMockChainState(CommonConstantsUtil.CHAIN.EVM, 'eip155:1')
      )
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        address: MOCK_ADDRESS
      } as unknown as AccountState)
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show fund wallet if receive and onramp are disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })

    it('should not show fund wallet if payWithExchange, onramp and receive are disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          swaps: true,
          receive: false
        },
        remoteFeatures: {
          payWithExchange: false,
          onramp: false
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      const fundWalletButton = HelpersUtil.getByTestId(
        element,
        'wallet-features-fund-wallet-button'
      )

      expect(fundWalletButton).toBeNull()
    })
  })

  describe('solana wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
        createMockChainState(CommonConstantsUtil.CHAIN.SOLANA, 'solana:mainnet')
      )
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        address: MOCK_ADDRESS
      } as unknown as AccountState)
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).not.toBeNull()
    })

    it('should not show fund wallet if onramp and receive are disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })

    it('should not show fund wallet if payWithExchange, onramp and receive are disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          swaps: true,
          receive: false
        },
        remoteFeatures: {
          payWithExchange: false,
          onramp: false
        }
      })

      const element: W3mAccountWalletFeaturesWidget = await fixture(
        html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
      )

      const fundWalletButton = HelpersUtil.getByTestId(
        element,
        'wallet-features-fund-wallet-button'
      )

      expect(fundWalletButton).toBeNull()
    })
  })

  describe('bitcoin wallet features', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
        createMockChainState(
          CommonConstantsUtil.CHAIN.BITCOIN,
          'bip122:000000000019d6689c085ae165831e93'
        )
      )
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        address: 'bc1qa1234567890'
      } as unknown as AccountState)
    })

    it('should only show fund wallet when receive and onramp are enabled', async () => {
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).not.toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })

    it('should not show fund wallet if onramp and receive are disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        features: {
          receive: false,
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

      expect(HelpersUtil.getByTestId(element, 'wallet-features-fund-wallet-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-swaps-button')).toBeNull()
      expect(HelpersUtil.getByTestId(element, 'wallet-features-send-button')).toBeNull()
    })
  })
})
