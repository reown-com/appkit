import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import {
  AccountController,
  ChainController,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  StorageUtil,
  CoreHelperUtil,
  type ChainControllerState,
  type OptionsControllerState
} from '@reown/appkit-core'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { type CaipNetwork } from '@reown/appkit-common'
import type { OptionsControllerStateInternal } from '../../../core/dist/types/src/controllers/OptionsController'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mAccountDefaultWidget', () => {
  const mockCaipAddress = 'eip155:1:0x123'
  const mockPlainAddress = '0x123'
  const mockProfileImage = 'profile.jpg'
  const mockProfileName = 'Test Account'
  const mockBalance = '100'
  const mockBalanceSymbol = 'ETH'

  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      caipAddress: mockCaipAddress,
      profileImage: mockProfileImage,
      profileName: mockProfileName,
      balance: mockBalance,
      balanceSymbol: mockBalanceSymbol,
      allAccounts: [{ address: mockPlainAddress, namespace: 'eip155', type: 'eoa' }],
      addressExplorerUrl: 'https://explorer.test',
      addressLabels: new Map(),
      preferredAccountType: 'eoa',
      currentTab: 0
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'eip155',
      activeCaipNetwork: { id: '1', caipNetworkId: 'eip155:1', name: 'Ethereum', symbol: 'ETH' }
    } as unknown as ChainControllerState)

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      features: {
        onramp: true,
        swaps: true,
        send: true,
        walletFeaturesOrder: ['onramp', 'swaps', 'send']
      }
    } as OptionsControllerState & OptionsControllerStateInternal)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    it('should not render if caipAddress is not present', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        caipAddress: undefined,
        allAccounts: [],
        addressLabels: new Map(),
        preferredAccountType: 'eoa',
        currentTab: 0
      })

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      const flex = HelpersUtil.querySelect(element, 'wui-flex')
      expect(flex).toBeNull()
    })

    it('renders single account view for Solana chain', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'solana',
        activeCaipNetwork: {
          chainNamespace: 'solana',
          id: '1',
          caipNetworkId: 'solana:1',
          name: 'Solana',
          nativeCurrency: {
            symbol: 'SOL',
            decimals: 9,
            name: 'Solana'
          },
          rpcUrls: { default: { http: ['https://api.mainnet-beta.solana.com'] } }
        }
      } as unknown as ChainControllerState)

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      expect(HelpersUtil.querySelect(element, '[data-testid="single-account-avatar"]')).toBeTruthy()
    })

    it('renders multi account view for EVM chain with multiple accounts', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        allAccounts: [
          { address: '0x123', type: 'eoa', namespace: 'eip155' },
          { address: '0x456', type: 'eoa', namespace: 'eip155' }
        ]
      })

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      expect(HelpersUtil.querySelect(element, 'wui-profile-button-v2')).toBeTruthy()
    })
  })

  describe('features', () => {
    it('shows onramp button when enabled and not Bitcoin', async () => {
      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      expect(
        HelpersUtil.querySelect(element, '[data-testid="w3m-account-default-onramp-button"]')
      ).toBeTruthy()
    })

    it('hides onramp button for Bitcoin chain', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'bip122',
        activeCaipNetwork: { id: '1', caipNetworkId: 'bip122:1' } as unknown as CaipNetwork
      } as unknown as ChainControllerState)

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      expect(
        HelpersUtil.querySelect(element, '[data-testid="w3m-account-default-onramp-button"]')
      ).toBeFalsy()
    })

    it('shows auth card for ID_AUTH connector', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        id: 'test',
        type: 'AUTH',
        chain: 'eip155',
        provider: { getEmail: () => 'testEmail@mail.com' } as unknown as W3mFrameProvider
      })

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      expect(
        HelpersUtil.querySelect(element, '[data-testid="w3m-wallet-upgrade-card"]')
      ).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('copies address and shows success message', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: mockCaipAddress
      })
      const copyToClipboardSpy = vi.spyOn(CoreHelperUtil, 'copyToClipboard')

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      const copyButton = HelpersUtil.querySelect(element, 'wui-icon-link')
      copyButton?.click()

      expect(copyToClipboardSpy).toHaveBeenCalledWith(mockPlainAddress)
    })

    it('disconnects wallet on disconnect button click', async () => {
      const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      const disconnectButton = HelpersUtil.querySelect(element, '[data-testid="disconnect-button"]')

      await disconnectButton?.click()

      expect(disconnectSpy).toHaveBeenCalled()
    })

    it('navigates to swap view when swap button is clicked', async () => {
      const routerSpy = vi.spyOn(RouterController, 'push')

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      const swapButton = Array.from(
        element.shadowRoot?.querySelectorAll('wui-list-item') || []
      ).find(item => item.textContent?.includes('Swap'))

      swapButton?.click()

      expect(routerSpy).toHaveBeenCalledWith('Swap')
    })
  })
})
