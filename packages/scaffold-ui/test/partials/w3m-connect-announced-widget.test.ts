import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorType, ConnectorWithProviders } from '@reown/appkit-controllers'
import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'
import { ConstantsUtil } from '@reown/appkit-utils'

import { W3mConnectAnnouncedWidget } from '../../src/partials/w3m-connect-announced-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const MOCK_CONNECTOR: ConnectorWithProviders = {
  id: 'mockConnector',
  name: 'Mock Wallet',
  type: ConstantsUtil.CONNECTOR_TYPE_ANNOUNCED as ConnectorType,
  info: {
    rdns: 'mock.wallet'
  },
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

const WALLET_CONNECT_CONNECTOR: ConnectorWithProviders = {
  id: 'walletConnect',
  name: 'WalletConnect',
  type: ConstantsUtil.CONNECTOR_TYPE_ANNOUNCED as ConnectorType,
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

describe('W3mConnectAnnouncedWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      excludedWallets: []
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything if there are no announced connectors', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render announced connectors', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_CONNECTOR]
    })

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, `wallet-selector-${MOCK_CONNECTOR.id}`)
    expect(walletSelector).not.toBeNull()
    expect(walletSelector.getAttribute('name')).toBe(MOCK_CONNECTOR.name)
    expect(walletSelector.getAttribute('tagLabel')).toBe('installed')
    expect(walletSelector.getAttribute('tagVariant')).toBe('success')
  })

  it('should not render excluded RDNS wallets', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_CONNECTOR]
    })

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      excludedWallets: [{ name: 'Mock Wallet', rdns: 'mock.wallet' }]
    })

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, `wallet-selector-${MOCK_CONNECTOR.id}`)
    expect(walletSelector).toBeNull()
  })

  it('should route to AllWallets on mobile for WalletConnect', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WALLET_CONNECT_CONNECTOR]
    })
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${WALLET_CONNECT_CONNECTOR.id}`
    )
    walletSelector.click()

    expect(pushSpy).toHaveBeenCalledWith('AllWallets')
  })

  it('should route to ConnectingWalletConnect on desktop for WalletConnect', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WALLET_CONNECT_CONNECTOR]
    })
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${WALLET_CONNECT_CONNECTOR.id}`
    )
    walletSelector.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect')
  })

  it('should route to ConnectingExternal for non-WalletConnect connectors', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_CONNECTOR]
    })
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(element, `wallet-selector-${MOCK_CONNECTOR.id}`)
    walletSelector.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', { connector: MOCK_CONNECTOR })
  })

  it('should handle unknown wallet names', async () => {
    const unknownConnector: ConnectorWithProviders = {
      ...MOCK_CONNECTOR,
      name: 'Unknown'
    }
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [unknownConnector]
    })

    const element: W3mConnectAnnouncedWidget = await fixture(
      html`<w3m-connect-announced-widget></w3m-connect-announced-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(element, `wallet-selector-${MOCK_CONNECTOR.id}`)
    expect(walletSelector.getAttribute('name')).toBe('Unknown')
  })
})
