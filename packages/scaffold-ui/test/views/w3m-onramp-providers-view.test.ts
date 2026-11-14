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

// --- Helpers ------------------------------------------------------ //
function mockSelectedProvider(url: string) {
  return vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
    ...OnRampController.state,
    providers: mockProviders,
    selectedProvider: { ...mockProviders[0], url } as OnRampProvider,
    purchaseCurrency: { id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] },
    purchaseCurrencies: [{ id: 'ETH', symbol: 'ETH', name: 'Ethereum', networks: [] }]
  })
}

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
    const setSelectedProviderSpy = vi
      .spyOn(OnRampController, 'setSelectedProvider')
      .mockResolvedValue(undefined)
    const routerPushSpy = vi.spyOn(RouterController, 'push')
    const popupWindow = { location: { href: '' }, close: vi.fn() } as unknown as Window
    const returnOpenHrefSpy = vi
      .spyOn(CoreHelperUtil, 'returnOpenHref')
      .mockReturnValue(popupWindow)
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    } as unknown as AccountState)

    const parameterizedUrl = 'https://meldcrypto.com/?wallet=0x123'
    const mockState = mockSelectedProvider(parameterizedUrl)

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    const providerItem = element.shadowRoot?.querySelector('w3m-onramp-provider-item')
    providerItem?.click()
    await vi.waitFor(() => expect(sendEventSpy).toHaveBeenCalled())

    expect(setSelectedProviderSpy).toHaveBeenCalledWith(mockProviders[0])
    expect(routerPushSpy).toHaveBeenCalledWith('BuyInProgress')
    expect(returnOpenHrefSpy).toHaveBeenCalledWith(
      '',
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    expect(popupWindow.location.href).toBe(parameterizedUrl)
    expect(openHrefSpy).not.toHaveBeenCalled()
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

  it('should open the popup synchronously before the provider URL is fetched', async () => {
    let resolveSelectedProvider: () => void = () => undefined
    vi.spyOn(OnRampController, 'setSelectedProvider').mockReturnValue(
      new Promise<void>(resolve => {
        resolveSelectedProvider = resolve
      })
    )
    const popupWindow = { location: { href: '' }, close: vi.fn() } as unknown as Window
    const returnOpenHrefSpy = vi
      .spyOn(CoreHelperUtil, 'returnOpenHref')
      .mockReturnValue(popupWindow)
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

    const parameterizedUrl = 'https://meldcrypto.com/?wallet=0x123'
    const mockState = mockSelectedProvider(parameterizedUrl)

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    element.shadowRoot?.querySelector('w3m-onramp-provider-item')?.click()

    expect(returnOpenHrefSpy).toHaveBeenCalledTimes(1)
    expect(popupWindow.location.href).toBe('')

    resolveSelectedProvider()
    await vi.waitFor(() => expect(sendEventSpy).toHaveBeenCalled())

    expect(popupWindow.location.href).toBe(parameterizedUrl)

    mockState.mockRestore()
  })

  it('should fall back to openHref when the popup could not be opened', async () => {
    vi.spyOn(OnRampController, 'setSelectedProvider').mockResolvedValue(undefined)
    vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(null)
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => undefined)

    const parameterizedUrl = 'https://meldcrypto.com/?wallet=0x123'
    const mockState = mockSelectedProvider(parameterizedUrl)

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    element.shadowRoot?.querySelector('w3m-onramp-provider-item')?.click()
    await vi.waitFor(() => expect(openHrefSpy).toHaveBeenCalled())

    expect(openHrefSpy).toHaveBeenCalledWith(
      parameterizedUrl,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )

    mockState.mockRestore()
  })

  it('should close the popup when fetching the provider URL fails', async () => {
    const error = new Error('Failed to fetch widget URL')
    const setSelectedProviderSpy = vi
      .spyOn(OnRampController, 'setSelectedProvider')
      .mockRejectedValue(error)
    const popupWindow = { location: { href: '' }, close: vi.fn() } as unknown as Window
    vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(popupWindow)
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

    const element: W3mOnRampProvidersView = await fixture(
      html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
    )

    await elementUpdated(element)

    await expect(
      (
        element as unknown as { onClickProvider: (p: OnRampProvider) => Promise<void> }
      ).onClickProvider(mockProviders[0]!)
    ).rejects.toThrow(error)

    expect(setSelectedProviderSpy).toHaveBeenCalledWith(mockProviders[0])
    expect(popupWindow.close).toHaveBeenCalled()
    expect(popupWindow.location.href).toBe('')
    expect(sendEventSpy).not.toHaveBeenCalled()
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
