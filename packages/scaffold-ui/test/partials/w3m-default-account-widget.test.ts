import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  StorageUtil
} from '@reown/appkit-controllers'
import type { AccountState, AuthConnector, ChainControllerState } from '@reown/appkit-controllers'

import type { W3mAccountDefaultWidget } from '../../src/partials/w3m-account-default-widget/index.js'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mAccountDefaultWidget', () => {
  const mockCaipAddress = 'eip155:1:0x123'
  const mockAddress = '0x123'
  const mockProfileName = 'Test Account'
  const mockProfileImage = 'profile.jpg'

  beforeEach(() => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockCaipAddress,
      address: mockAddress,
      profileName: mockProfileName,
      profileImage: mockProfileImage,
      balance: '100',
      balanceSymbol: 'ETH',
      addressExplorerUrl: 'https://etherscan.io',
      addressLabels: new Map(),
      preferredAccountType: 'eoa'
    } as unknown as AccountState)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: {
        id: '1',
        caipNetworkId: 'eip155:1'
      }
    } as unknown as ChainControllerState)

    // Mock OptionsController state
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      features: {
        walletFeaturesOrder: ['onramp', 'swaps', 'send']
      },
      remoteFeatures: {
        onramp: ['meld'],
        swaps: ['1inch'],
        send: true
      }
    } as any)

    // Mock other controllers
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('test')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)
    vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(vi.fn())
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
    vi.spyOn(ModalController, 'close').mockImplementation(vi.fn())
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(SnackController, 'showSuccess').mockImplementation(vi.fn())
    vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when no caipAddress', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: null
      } as unknown as AccountState)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      // Should only have styles tag
      expect(element.shadowRoot?.children.length).toBe(1)
    })

    it('renders single account view for Solana chain', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: ConstantsUtil.CHAIN.SOLANA
      } as unknown as ChainControllerState)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(HelpersUtil.querySelect(element, '[data-testid="single-account-avatar"]')).toBeTruthy()
    })

    it('renders wallet switch button', async () => {
      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(HelpersUtil.querySelect(element, 'wui-wallet-switch')).toBeTruthy()
    })
  })

  describe('Features', () => {
    it('shows fund wallet button when enabled for supported chain', async () => {
      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(
        HelpersUtil.querySelect(element, '[data-testid="w3m-account-default-fund-wallet-button"]')
      ).toBeTruthy()
    })

    it('should not show fund wallet button when disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        features: {
          onramp: false
        }
      } as any)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(HelpersUtil.getByTestId(element, 'w3m-account-fund-wallet-button')).toBeFalsy()
    })

    it('should not show fund wallet button for non-enabled chain', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: ConstantsUtil.CHAIN.BITCOIN
      } as unknown as ChainControllerState)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(HelpersUtil.getByTestId(element, 'w3m-account-fund-wallet-button')).toBeFalsy()
    })

    it('shows swap button for EVM chain', async () => {
      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const text = HelpersUtil.querySelectAll(element, 'wui-text')
      expect([...text].some(t => t.textContent?.includes('Swap'))).toBeTruthy()
    })

    it('does not show swap button when disabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        features: {
          swaps: false
        }
      } as any)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const texts = HelpersUtil.querySelectAll(element, 'wui-text')
      expect([...texts].some(text => text?.textContent?.includes('Swap'))).toBeFalsy()
    })

    it('does not show swap button for non-EVM chain', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: ConstantsUtil.CHAIN.SOLANA
      } as unknown as ChainControllerState)

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const texts = HelpersUtil.querySelectAll(element, 'wui-text')
      expect([...texts].some(text => text?.textContent?.includes('Swap'))).toBeFalsy()
    })

    it('shows auth card for AUTH connector', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(
        ConstantsUtil.CONNECTOR_ID.AUTH
      )
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        id: 'auth',
        provider: {
          getEmail: () => 'email@email.com'
        }
      } as AuthConnector)
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
        ConstantsUtil.CONNECTOR_ID.AUTH
      )

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      expect(
        HelpersUtil.querySelect(element, '[data-testid="w3m-wallet-upgrade-card"]')
      ).toBeTruthy()
    })
  })

  describe('Interactions', () => {
    it('disconnects wallet successfully', async () => {
      vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue()

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const disconnectButton = HelpersUtil.querySelect(element, '[data-testid="disconnect-button"]')
      await disconnectButton?.click()

      expect(ConnectionController.disconnect).toHaveBeenCalled()
    })

    it('handles disconnect failure', async () => {
      vi.spyOn(ConnectionController, 'disconnect').mockRejectedValue(new Error())

      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const disconnectButton = HelpersUtil.querySelect(element, '[data-testid="disconnect-button"]')
      await disconnectButton?.click()

      expect(EventsController.sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'DISCONNECT_ERROR',
        properties: { message: 'Failed to disconnect' }
      })
      expect(SnackController.showError).toHaveBeenCalledWith('Failed to disconnect')
    })

    it('navigates to explorer', async () => {
      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const explorerButton = HelpersUtil.querySelect(element, 'wui-button')
      await explorerButton?.click()

      expect(CoreHelperUtil.openHref).toHaveBeenCalledWith('https://etherscan.io', '_blank')
    })
  })

  describe('State Updates', () => {
    it('cleans up subscriptions on disconnect', async () => {
      const element: W3mAccountDefaultWidget = await fixture(
        html`<w3m-account-default-widget></w3m-account-default-widget>`
      )
      const unsubscribeSpy = vi.fn()
      ;(element as any).unsubscribe = [unsubscribeSpy]

      element.disconnectedCallback()
      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })
})
