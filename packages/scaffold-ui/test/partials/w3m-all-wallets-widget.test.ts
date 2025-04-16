import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  type ApiControllerState,
  ConnectorController,
  type ConnectorControllerState,
  type ConnectorWithProviders,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  type OptionsControllerState,
  type OptionsControllerStateInternal,
  type PreferredAccountTypes,
  RouterController,
  type SdkVersion
} from '@reown/appkit-controllers'

import { W3mAllWalletsWidget } from '../../src/partials/w3m-all-wallets-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const ALL_WALLETS_TEST_ID = 'all-wallets'
const WALLET_CONNECT_ID = 'walletConnect'

const mockConnectorState: ConnectorControllerState = {
  connectors: [],
  activeConnector: undefined,
  allConnectors: [],
  filterByNamespace: undefined,
  activeConnectorIds: {
    eip155: undefined,
    solana: undefined,
    polkadot: undefined,
    bip122: undefined
  }
}

const mockOptionsState: OptionsControllerState & OptionsControllerStateInternal = {
  allWallets: 'SHOW' as const,
  projectId: 'test-project-id',
  sdkVersion: '1.0.0' as SdkVersion,
  sdkType: 'appkit' as const,
  defaultAccountTypes: {} as PreferredAccountTypes
}

const mockConnector: ConnectorWithProviders = {
  id: WALLET_CONNECT_ID,
  type: 'WALLET_CONNECT',
  name: 'WalletConnect',
  chain: 'eip155'
}

const featuredWallets = [
  {
    id: '1',
    name: 'Test Wallet',
    rdns: 'io.test',
    homepage: 'https://test.com',
    image_url: 'https://test.com/image.png'
  }
]

const mockApiState: ApiControllerState = {
  page: 1,
  count: 8,
  featured: featuredWallets,
  allFeatured: featuredWallets,
  allRecommended: [],
  promises: {},
  recommended: [],
  wallets: [],
  search: [],
  isAnalyticsEnabled: false,
  excludedWallets: [],
  isFetchingRecommendedWallets: false
}

describe('W3mAllWalletsWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render if WalletConnect connector is not found', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue(mockConnectorState)

    const element: W3mAllWalletsWidget = await fixture(
      html`<w3m-all-wallets-widget></w3m-all-wallets-widget>`
    )

    expect(HelpersUtil.getByTestId(element, ALL_WALLETS_TEST_ID)).toBeNull()
  })

  it('should not render if allWallets option is HIDE', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...mockConnectorState,
      connectors: [mockConnector]
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      allWallets: 'HIDE' as const
    } as OptionsControllerState & OptionsControllerStateInternal)

    const element: W3mAllWalletsWidget = await fixture(
      html`<w3m-all-wallets-widget></w3m-all-wallets-widget>`
    )

    expect(HelpersUtil.getByTestId(element, ALL_WALLETS_TEST_ID)).toBeNull()
  })

  it('should not render if allWallets is ONLY_MOBILE and not on mobile', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...mockConnectorState,
      connectors: [mockConnector]
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      allWallets: 'ONLY_MOBILE' as const
    } as OptionsControllerState & OptionsControllerStateInternal)
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

    const element: W3mAllWalletsWidget = await fixture(
      html`<w3m-all-wallets-widget></w3m-all-wallets-widget>`
    )

    expect(HelpersUtil.getByTestId(element, ALL_WALLETS_TEST_ID)).toBeNull()
  })

  it('should render with correct wallet count tag', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...mockConnectorState,
      connectors: [mockConnector]
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue(mockOptionsState)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockApiState)

    const element: W3mAllWalletsWidget = await fixture(
      html`<w3m-all-wallets-widget></w3m-all-wallets-widget>`
    )

    const walletList = HelpersUtil.getByTestId(element, ALL_WALLETS_TEST_ID)
    expect(walletList).not.toBeNull()
    expect(walletList.getAttribute('tagLabel')).toBe('9')
  })

  it('should navigate to AllWallets view and track event on click', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...mockConnectorState,
      connectors: [mockConnector]
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue(mockOptionsState)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockApiState)

    const routerPushSpy = vi.spyOn(RouterController, 'push')
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')

    const element: W3mAllWalletsWidget = await fixture(
      html`<w3m-all-wallets-widget></w3m-all-wallets-widget>`
    )

    const walletList = HelpersUtil.getByTestId(element, ALL_WALLETS_TEST_ID)
    walletList.click()

    expect(sendEventSpy).toHaveBeenCalledWith({ type: 'track', event: 'CLICK_ALL_WALLETS' })
    expect(routerPushSpy).toHaveBeenCalledWith('AllWallets')
  })
})
