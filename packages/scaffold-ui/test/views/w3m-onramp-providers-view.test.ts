import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  type ChainAdapter,
  ChainController,
  CoreHelperUtil,
  EventsController,
  OnRampController,
  type OnRampProvider,
  RouterController
} from '@reown/appkit-controllers'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { W3mOnRampProvidersView } from '../../src/views/w3m-onramp-providers-view'

// --- Constants ---------------------------------------------------- //
const mockProviders: OnRampProvider[] = [
  {
    name: 'meld',
    label: 'Meld.io',
    url: 'https://meldcrypto.com',
    feeRange: '1-2%',
    supportedChains: ['eip155', 'solana']
  }
]

describe('W3mOnRampProvidersView', () => {
  beforeEach(() => {
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      providers: mockProviders,
      purchaseCurrency: { id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] },
      purchaseCurrencies: [{ id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] }]
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              address: '0x123',
              preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            } as AccountState
          } as ChainAdapter
        ]
      ]),
      activeChain: 'eip155',
      activeCaipNetwork: {
        id: 'eip155:1',
        name: 'ethereum',
        rpcUrls: { default: { http: ['https://eth.llamarpc.com'] } },
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      }
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      address: '0x123'
    } as unknown as AccountState)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render provider list filtered by chain', async () => {
    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const providerItems = element.shadowRoot?.querySelectorAll('w3m-onramp-provider-item')
    expect(providerItems?.length).toBe(1)

    const meldItem = providerItems?.[0]
    expect(meldItem?.getAttribute('name')).toBe('meld')
    expect(meldItem?.getAttribute('label')).toBe('Meld.io')
    expect(meldItem?.getAttribute('feeRange')).toBe('1-2%')
  })

  it('should handle provider selection', async () => {
    const setSelectedProviderSpy = vi.spyOn(OnRampController, 'setSelectedProvider')
    const routerPushSpy = vi.spyOn(RouterController, 'push')
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    } as unknown as AccountState)

    const parameterizedUrl = 'https://meldcrypto.com'
    const mockState = vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      providers: mockProviders,
      selectedProvider: {
        name: mockProviders[0]!.name,
        label: mockProviders[0]!.label,
        url: parameterizedUrl,
        feeRange: mockProviders[0]!.feeRange,
        supportedChains: mockProviders[0]!.supportedChains
      } as OnRampProvider,
      purchaseCurrency: { id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] },
      purchaseCurrencies: [{ id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] }]
    })

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const providerItem = element.shadowRoot?.querySelector('w3m-onramp-provider-item')
    providerItem?.click()

    expect(setSelectedProviderSpy).toHaveBeenCalledWith(mockProviders[0])
    expect(routerPushSpy).toHaveBeenCalledWith('BuyInProgress')
    expect(openHrefSpy).toHaveBeenCalledWith(
      parameterizedUrl,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_BUY_PROVIDER',
      properties: {
        provider: 'meld',
        isSmartAccount: true
      }
    })

    mockState.mockRestore()
  })

  it('should handle subscription updates', async () => {
    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const updatedProviders: OnRampProvider[] = [mockProviders[0]] as OnRampProvider[]
    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      providers: updatedProviders
    })

    const updatedElement: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )
    await elementUpdated(updatedElement)

    const providerItems = updatedElement.shadowRoot?.querySelectorAll('w3m-onramp-provider-item')
    expect(providerItems?.length).toBe(1)
  })

  it('should handle Meld provider without URL generation', async () => {
    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const providerItems = element.shadowRoot?.querySelectorAll('w3m-onramp-provider-item')
    expect(providerItems?.length).toBe(1)

    const meldItem = providerItems?.[0]
    expect(meldItem?.getAttribute('name')).toBe('meld')
  })
})
