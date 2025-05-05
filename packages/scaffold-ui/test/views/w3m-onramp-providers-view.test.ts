import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AccountController,
  BlockchainApiController,
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
    name: 'coinbase',
    label: 'Coinbase',
    url: 'https://coinbase.com/onramp',
    feeRange: '1-3%',
    supportedChains: ['eip155']
  },
  {
    name: 'coinbase',
    label: 'Other Provider',
    url: 'https://other.com',
    feeRange: '2-4%',
    supportedChains: ['eip155']
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

    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: '0x123',
      preferredAccountTypes: {
        eip155: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })

    vi.spyOn(BlockchainApiController, 'generateOnRampURL').mockResolvedValue(
      'https://coinbase.com/onramp'
    )
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
    expect(providerItems?.length).toBe(2)

    const coinbaseItem = providerItems?.[0]
    expect(coinbaseItem?.getAttribute('name')).toBe('coinbase')
    expect(coinbaseItem?.getAttribute('label')).toBe('Coinbase')
    expect(coinbaseItem?.getAttribute('feeRange')).toBe('1-3%')
  })

  it('should handle provider selection', async () => {
    const setSelectedProviderSpy = vi.spyOn(OnRampController, 'setSelectedProvider')
    const routerPushSpy = vi.spyOn(RouterController, 'push')
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const providerItem = element.shadowRoot?.querySelector('w3m-onramp-provider-item')
    providerItem?.click()

    expect(setSelectedProviderSpy).toHaveBeenCalledWith(mockProviders[0])
    expect(routerPushSpy).toHaveBeenCalledWith('BuyInProgress')
    expect(openHrefSpy).toHaveBeenCalledWith(
      'https://coinbase.com/onramp',
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_BUY_PROVIDER',
      properties: {
        provider: 'coinbase',
        isSmartAccount: true
      }
    })
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

  it('should handle Coinbase URL generation', async () => {
    const generateUrlSpy = vi.spyOn(BlockchainApiController, 'generateOnRampURL')

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    expect(generateUrlSpy).toHaveBeenCalledWith({
      defaultNetwork: 'ethereum',
      destinationWallets: [
        {
          address: '0x123',
          blockchains: [
            'ethereum',
            'arbitrum',
            'polygon',
            'berachain',
            'avalanche-c-chain',
            'optimism',
            'celo',
            'base'
          ],
          assets: ['ETH']
        }
      ],
      partnerUserId: '0x123',
      purchaseAmount: undefined
    })
  })
})
