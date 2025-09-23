import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorType, ConnectorWithProviders } from '@reown/appkit-controllers'
import {
  AssetController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'
import { ConstantsUtil } from '@reown/appkit-utils'

import { W3mConnectWalletConnectWidget } from '../../src/partials/w3m-connect-walletconnect-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const WALLET_CONNECT_CONNECTOR: ConnectorWithProviders = {
  id: 'walletConnect',
  name: 'WalletConnect',
  type: ConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType,
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

const OTHER_CONNECTOR: ConnectorWithProviders = {
  id: 'otherConnector',
  name: 'Other Wallet',
  type: ConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType,
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

describe('W3mConnectWalletConnectWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      connectorImages: {}
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything on mobile', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WALLET_CONNECT_CONNECTOR]
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should not render if WalletConnect connector is not available', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [OTHER_CONNECTOR]
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render WalletConnect connector with default image', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WALLET_CONNECT_CONNECTOR]
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, 'wallet-selector-walletconnect')
    expect(walletSelector).not.toBeNull()
    expect(walletSelector.getAttribute('name')).toBe(WALLET_CONNECT_CONNECTOR.name)
    expect(walletSelector.getAttribute('tagLabel')).toBe('qr code')
    expect(walletSelector.getAttribute('tagVariant')).toBe('accent')
  })

  it('should render WalletConnect connector with custom image URL', async () => {
    const connectorWithImage = {
      ...WALLET_CONNECT_CONNECTOR,
      imageUrl: 'https://example.com/image.png'
    }
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [connectorWithImage]
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, 'wallet-selector-walletconnect')
    expect(walletSelector.getAttribute('imageSrc')).toBe(connectorWithImage.imageUrl)
  })

  it('should handle connector image from AssetController', async () => {
    const imageId = 'walletconnect-image'
    const imageUrl = 'https://example.com/asset-image.png'
    const connectorWithImageId = {
      ...WALLET_CONNECT_CONNECTOR,
      imageId
    }

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [connectorWithImageId]
    })

    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      connectorImages: { [imageId]: imageUrl }
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, 'wallet-selector-walletconnect')
    expect(walletSelector.getAttribute('imageSrc')).toBe(imageUrl)
  })

  it('should route to ConnectingWalletConnect on click', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [WALLET_CONNECT_CONNECTOR]
    })
    const setActiveConnectorSpy = vi.spyOn(ConnectorController, 'setActiveConnector')
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(element, 'wallet-selector-walletconnect')
    walletSelector.click()

    expect(setActiveConnectorSpy).toHaveBeenCalledWith(WALLET_CONNECT_CONNECTOR)
    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', {
      redirectView: undefined
    })
  })

  it('should handle unknown wallet name', async () => {
    const unknownConnector: ConnectorWithProviders = {
      ...WALLET_CONNECT_CONNECTOR,
      name: undefined
    } as unknown as ConnectorWithProviders

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [unknownConnector]
    })

    const element: W3mConnectWalletConnectWidget = await fixture(
      html`<w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(element, 'wallet-selector-walletconnect')
    expect(walletSelector.getAttribute('name')).toBe('Unknown')
  })
})
