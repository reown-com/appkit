import { W3mNetworksView } from '../../src/views/w3m-networks-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AccountController,
  AssetUtil,
  ChainController,
  ConnectorController,
  EventsController,
  RouterController,
  StorageUtil,
  type AccountControllerState,
  type ChainControllerState
} from '@reown/appkit-core'
import type { CaipNetwork } from '@reown/appkit-common'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

describe('W3mNetworksView', () => {
  const mockNetworks: CaipNetwork[] = [
    {
      id: '1',
      name: 'Ethereum',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:1'
    } as unknown as CaipNetwork,
    {
      id: '137',
      name: 'Polygon',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:137'
    } as unknown as CaipNetwork,
    {
      id: 'mainnet',
      name: 'Solana',
      chainNamespace: 'solana',
      caipNetworkId: 'solana:mainnet'
    } as unknown as CaipNetwork
  ]

  const mockAuthConnector = {
    id: 'ID_AUTH',
    chain: 'eip155' as const,
    type: 'AUTH' as const,
    provider: {
      setPreferredAccountType: () => {},
      getEmail: () => 'test@test.com'
    } as unknown as W3mFrameProvider
  }

  beforeEach(() => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: mockNetworks[0],
      activeChain: 'eip155'
    } as ChainControllerState)
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(mockNetworks)
    vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:1'])
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('network.png')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders network list with search input', async () => {
    const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)

    expect(HelpersUtil.querySelect(element, '.network-search-input')).toBeTruthy()
    const networks = element.shadowRoot?.querySelectorAll('wui-list-network')
    expect(networks?.length).toBe(3)
  })

  it('filters networks based on search', async () => {
    const element: W3mNetworksView = await fixture(html`<w3m-networks-view></w3m-networks-view>`)

    vi.useFakeTimers()
    const input = HelpersUtil.querySelect(element, 'wui-input-text')
    input?.dispatchEvent(new CustomEvent('inputChange', { detail: 'polygon' }))

    vi.runAllTimers()
    element.requestUpdate()
    await elementUpdated(element)

    const networks = element.shadowRoot?.querySelectorAll('wui-list-network')
    expect(networks?.length).toBe(1)

    expect(networks?.[0]?.getAttribute('name')).toBe('Polygon')
  })

  it('navigates to network help', async () => {
    const eventSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerSpy = vi.spyOn(RouterController, 'push')

    const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
    const helpLink = HelpersUtil.querySelect(element, 'wui-link')
    helpLink?.click()

    expect(eventSpy).toHaveBeenCalledWith({ type: 'track', event: 'CLICK_NETWORK_HELP' })
    expect(routerSpy).toHaveBeenCalledWith('WhatIsANetwork')
  })

  describe('network switching', () => {
    it('skips switch for same network', async () => {
      const routerSpy = vi.spyOn(RouterController, 'push')

      const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
      const networkButton = HelpersUtil.querySelect(
        element,
        '[data-testid="w3m-network-switch-Ethereum"]'
      )
      await networkButton?.click()

      expect(routerSpy).not.toHaveBeenCalled()
    })

    it('handles switch for different namespace', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        caipAddress: 'eip155:1:0x123'
      } as unknown as AccountControllerState)
      vi.spyOn(ChainController, 'getAccountProp').mockReturnValue(undefined)

      const routerSpy = vi.spyOn(RouterController, 'push')

      const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
      const networkButton = HelpersUtil.querySelect(
        element,
        '[data-testid="w3m-network-switch-Solana"]'
      )
      await networkButton?.click()

      expect(routerSpy).toHaveBeenCalledWith('SwitchActiveChain', {
        switchToChain: 'solana',
        navigateTo: 'Connect',
        navigateWithReplace: true,
        network: {
          id: 'mainnet',
          name: 'Solana',
          chainNamespace: 'solana',
          caipNetworkId: 'solana:mainnet'
        }
      })
    })

    it('handles switch for auth connector', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

      const routerSpy = vi.spyOn(RouterController, 'push')

      const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
      const networkButton = HelpersUtil.querySelect(
        element,
        '[data-testid="w3m-network-switch-Polygon"]'
      )
      await networkButton?.click()

      expect(routerSpy).toHaveBeenCalledWith('SwitchNetwork', expect.any(Object))
    })
  })

  describe('network disabled state', () => {
    it('enables network for auth connector', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

      const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
      const networkButton = HelpersUtil.querySelect(
        element,
        '[data-testid="w3m-network-switch-Polygon"]'
      )

      expect(networkButton?.getAttribute('disabled')).toBeFalsy()
    })

    it('disables network when not approved and not supporting all networks', async () => {
      vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(false)
      vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue('eip155:1:0x123')

      const element = await fixture(html`<w3m-networks-view></w3m-networks-view>`)
      const networkButton = HelpersUtil.querySelect(
        element,
        '[data-testid="w3m-network-switch-Polygon"]'
      )

      expect(networkButton?.getAttribute('disabled')).toBe(null)
    })
  })
})
