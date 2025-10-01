import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mConnectingWcBasicView } from '../../src/views/w3m-connecting-wc-basic-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const CONNECTOR_LIST_SELECTOR = 'w3m-connector-list'
const ALL_WALLETS_WIDGET_SELECTOR = 'w3m-all-wallets-widget'
const CONNECTING_WC_VIEW_SELECTOR = 'w3m-connecting-wc-view'
const REOWN_BRANDING_SELECTOR = 'wui-ux-by-reown'

describe('W3mConnectingWcBasicView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { reownBranding: false },
      customWallets: [],
      allWallets: 'SHOW'
    })
    vi.spyOn(OptionsController, 'subscribeKey').mockImplementation(vi.fn().mockReturnValue(vi.fn()))
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [],
      recommended: [],
      count: 0,
      filteredWallets: [],
      isFetchingRecommendedWallets: false,
      excludedWallets: []
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [
        { id: 'walletConnect', name: 'WalletConnect', type: 'WALLET_CONNECT', chain: 'eip155' }
      ]
    })
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(vi.fn())
    )
    vi.spyOn(ConnectionController, 'hasAnyConnection').mockReturnValue(false)
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])
  })

  it('should render', async () => {
    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render desktop layout when not mobile', async () => {
    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectingView = HelpersUtil.querySelect(element, CONNECTING_WC_VIEW_SELECTOR)
    const allWalletsWidget = HelpersUtil.querySelect(element, ALL_WALLETS_WIDGET_SELECTOR)

    expect(connectingView).toBeTruthy()
    expect(allWalletsWidget).toBeTruthy()
  })

  it('should render mobile layout when on mobile', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [{ id: 'test', name: 'Test Wallet' }],
      recommended: [],
      count: 0,
      filteredWallets: [],
      isFetchingRecommendedWallets: false,
      excludedWallets: []
    })

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    const allWalletsWidget = HelpersUtil.querySelect(element, ALL_WALLETS_WIDGET_SELECTOR)

    expect(connectorList).toBeTruthy()
    expect(allWalletsWidget).toBeTruthy()
  })

  it('should not render connector list on mobile when no connectors available', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [],
      recommended: [],
      excludedWallets: []
    })
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    expect(connectorList).toBeNull()
  })

  it('should render connector list on mobile when featured wallets available', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [{ id: 'test', name: 'Test Wallet' }],
      recommended: [],
      excludedWallets: []
    })

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    expect(connectorList).toBeTruthy()
  })

  it('should render connector list on mobile when recommended wallets available', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [],
      recommended: [{ id: 'test', name: 'Test Wallet' }],
      excludedWallets: []
    })

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    expect(connectorList).toBeTruthy()
  })

  it('should render connector list on mobile when custom wallets available', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [{ id: 'test', name: 'Test Wallet' }]
    })

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    expect(connectorList).toBeTruthy()
  })

  it('should render connector list on mobile when recent wallets available', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([{ id: 'test', name: 'Test Wallet' }])

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const connectorList = HelpersUtil.querySelect(element, CONNECTOR_LIST_SELECTOR)
    expect(connectorList).toBeTruthy()
  })

  it('should render reown branding when remoteFeatures.reownBranding is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { reownBranding: true }
    })

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const reownBranding = HelpersUtil.querySelect(element, REOWN_BRANDING_SELECTOR)
    expect(reownBranding).toBeTruthy()
  })

  it('should not render reown branding when remoteFeatures.reownBranding is false', async () => {
    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    const reownBranding = HelpersUtil.querySelect(element, REOWN_BRANDING_SELECTOR)
    expect(reownBranding).toBeNull()
  })

  it('should subscribe to OptionsController state changes', async () => {
    const subscribeSpy = vi
      .spyOn(OptionsController, 'subscribeKey')
      .mockImplementation(vi.fn().mockReturnValue(vi.fn()))

    await fixture(html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('remoteFeatures', expect.any(Function))
  })

  it('should unsubscribe on disconnect', async () => {
    const mockUnsubscribe = vi.fn()
    vi.spyOn(OptionsController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(mockUnsubscribe)
    )

    const element: W3mConnectingWcBasicView = await fixture(
      html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
    )

    element.disconnectedCallback()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
