import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { ConnectorType, ConnectorWithProviders, WcWallet } from '@reown/appkit-controllers'
import {
  ApiController,
  AssetUtil,
  ConnectorController,
  RouterController
} from '@reown/appkit-controllers'
import { ConstantsUtil } from '@reown/appkit-utils'

import { W3mConnectFeaturedWidget } from '../../src/partials/w3m-connect-featured-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const MOCK_WALLET: WcWallet = {
  id: 'mockWallet',
  name: 'Mock Wallet',
  homepage: 'https://mock.wallet',
  image_url: 'https://mock.wallet/icon.png',
  order: 1,
  mobile_link: 'mock://wallet',
  desktop_link: 'mock://wallet',
  webapp_link: 'https://mock.wallet/app',
  rdns: 'mock.wallet'
}

const MOCK_CONNECTOR: ConnectorWithProviders = {
  id: 'mockWallet',
  name: 'Mock Wallet',
  provider: undefined,
  type: ConstantsUtil.CONNECTOR_TYPE_ANNOUNCED as ConnectorType,
  chain: 'eip155',
  info: {
    rdns: 'mock.wallet'
  }
}

describe('W3mConnectFeaturedWidget', () => {
  beforeEach(() => {
    vi.spyOn(AssetUtil, 'getWalletImage').mockReturnValue('mock-image-url')
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: []
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything if there are no featured wallets', async () => {
    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget></w3m-connect-featured-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render featured wallets', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [MOCK_WALLET]
    })

    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget></w3m-connect-featured-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-featured-${MOCK_WALLET.id}`
    )
    expect(walletSelector).not.toBeNull()
    expect(walletSelector.getAttribute('name')).toBe(MOCK_WALLET.name)
    expect(walletSelector.getAttribute('imageSrc')).toBe('mock-image-url')
  })

  it('should route to ConnectingExternal when wallet has a connector', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [MOCK_WALLET]
    })
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(MOCK_CONNECTOR)
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget></w3m-connect-featured-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-featured-${MOCK_WALLET.id}`
    )
    walletSelector.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', { connector: MOCK_CONNECTOR })
  })

  it('should route to ConnectingWalletConnect when wallet has no connector', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [MOCK_WALLET]
    })
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget></w3m-connect-featured-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-featured-${MOCK_WALLET.id}`
    )
    walletSelector.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', { wallet: MOCK_WALLET })
  })

  it('should handle unknown wallet names', async () => {
    const unknownWallet = {
      ...MOCK_WALLET,
      name: undefined as unknown as string
    }
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [unknownWallet]
    })

    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget></w3m-connect-featured-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-featured-${MOCK_WALLET.id}`
    )
    expect(walletSelector.getAttribute('name')).toBe('Unknown')
  })

  it('should pass tabIdx to wallet list items when provided', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [MOCK_WALLET]
    })

    const element: W3mConnectFeaturedWidget = await fixture(
      html`<w3m-connect-featured-widget .tabIdx=${1}></w3m-connect-featured-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-featured-${MOCK_WALLET.id}`
    )
    expect(walletSelector.getAttribute('tabIdx')).toBe('1')
  })
})
