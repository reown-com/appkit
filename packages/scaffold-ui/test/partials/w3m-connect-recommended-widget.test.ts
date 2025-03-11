import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorWithProviders, WcWallet } from '@reown/appkit-controllers'
import {
  ApiController,
  ConnectorController,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mConnectRecommendedWidget } from '../../src/partials/w3m-connect-recommended-widget'

// --- Constants ---------------------------------------------------- //
const MOCK_WALLET_CONNECT_CONNECTOR: ConnectorWithProviders = {
  id: 'walletConnect',
  name: 'WalletConnect',
  type: 'WALLET_CONNECT',
  chain: CommonConstantsUtil.CHAIN.EVM
}

const MOCK_RECOMMENDED_WALLET: WcWallet = {
  id: 'mockWallet',
  name: 'Mock Wallet',
  mobile: {
    native: 'mock://wallet',
    universal: 'https://mock.wallet'
  },
  desktop: {
    native: '',
    universal: 'https://mock.wallet'
  }
} as WcWallet

describe('W3mConnectRecommendedWidget', () => {
  beforeEach(() => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_WALLET_CONNECT_CONNECTOR]
    })

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      recommended: [MOCK_RECOMMENDED_WALLET]
    })

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: undefined,
      featuredWalletIds: undefined
    })

    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render if WalletConnect connector is not available', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    expect(element.render()).toBeNull()
  })

  it('should not render if customWallets are set', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_RECOMMENDED_WALLET]
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should not render if featuredWalletIds are set', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      featuredWalletIds: ['mock-id']
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should not render if there are no recommended wallets', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      recommended: []
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render recommended wallets', async () => {
    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletList = element.shadowRoot?.querySelector('wui-flex')
    expect(walletList).not.toBeNull()

    const walletItem = element.shadowRoot?.querySelector('wui-list-wallet')
    expect(walletItem).not.toBeNull()
    expect(walletItem?.getAttribute('name')).toBe(MOCK_RECOMMENDED_WALLET.name)
  })

  it('should handle unknown wallet names', async () => {
    const unknownWallet: WcWallet = {
      ...MOCK_RECOMMENDED_WALLET,
      name: undefined
    } as unknown as WcWallet

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      recommended: [unknownWallet]
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletItem = element.shadowRoot?.querySelector('wui-list-wallet')
    expect(walletItem?.getAttribute('name')).toBe('Unknown')
  })

  it('should route to ConnectingExternal when wallet has a connector', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push')
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(MOCK_WALLET_CONNECT_CONNECTOR)

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    const walletItem = element.shadowRoot?.querySelector('wui-list-wallet')
    walletItem?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', {
      connector: MOCK_WALLET_CONNECT_CONNECTOR
    })
  })

  it('should route to ConnectingWalletConnect when wallet has no connector', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push')
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    const walletItem = element.shadowRoot?.querySelector('wui-list-wallet')
    walletItem?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', {
      wallet: MOCK_RECOMMENDED_WALLET
    })
  })

  it('should limit recommended wallets based on injected wallets', async () => {
    const injectedConnector: ConnectorWithProviders = {
      id: 'injected',
      name: 'Injected Wallet',
      type: 'INJECTED',
      chain: CommonConstantsUtil.CHAIN.EVM
    }

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_WALLET_CONNECT_CONNECTOR, injectedConnector]
    })

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      recommended: [MOCK_RECOMMENDED_WALLET, { ...MOCK_RECOMMENDED_WALLET, id: 'mock2' }]
    })

    const element: W3mConnectRecommendedWidget = await fixture(
      html`<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletItems = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletItems?.length).toBe(1)
  })
})
