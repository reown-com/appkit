import { W3mAllWalletsWidget } from '../../src/partials/w3m-all-wallets-widget'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  type ConnectorControllerState,
  type ConnectorWithProviders,
  type ApiControllerState,
  type OptionsControllerState,
  type SdkVersion
} from '@reown/appkit-core'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { OptionsControllerStateInternal } from '../../../core/dist/types/src/controllers/OptionsController'

// --- Constants ---------------------------------------------------- //
const ALL_WALLETS_TEST_ID = 'all-wallets'
const WALLET_CONNECT_ID = 'walletConnect'

const mockConnectorState: ConnectorControllerState = {
  connectors: [],
  activeConnector: undefined,
  allConnectors: []
}

const mockOptionsState: OptionsControllerState & OptionsControllerStateInternal = {
  allWallets: 'SHOW' as const,
  projectId: 'test-project-id',
  sdkVersion: '1.0.0' as SdkVersion,
  sdkType: 'appkit' as const
}

const mockConnector: ConnectorWithProviders = {
  id: WALLET_CONNECT_ID,
  type: 'WALLET_CONNECT',
  name: 'WalletConnect',
  chain: 'eip155'
}

const mockApiState: ApiControllerState = {
  page: 1,
  count: 8,
  featured: [
    {
      id: '1',
      name: 'Test Wallet',
      rdns: 'io.test',
      homepage: 'https://test.com',
      image_url: 'https://test.com/image.png'
    }
  ],
  recommended: [],
  wallets: [],
  search: [],
  isAnalyticsEnabled: false,
  excludedRDNS: []
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
    } as unknown as OptionsControllerState & OptionsControllerStateInternal)

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
    } as unknown as OptionsControllerState & OptionsControllerStateInternal)
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
