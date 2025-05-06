import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorWithProviders, WcWallet } from '@reown/appkit-controllers'
import {
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mConnectCustomWidget } from '../../src/partials/w3m-connect-custom-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const MOCK_CUSTOM_WALLET: WcWallet = {
  id: 'mockWallet',
  name: 'Mock Custom Wallet',
  rdns: 'mock.custom.wallet'
}

const MOCK_METAMASK_WALLET: WcWallet = {
  id: 'metamask',
  name: 'MetaMask',
  rdns: 'io.metamask'
}

const MOCK_CONNECTOR: ConnectorWithProviders = {
  id: 'mockConnector',
  name: 'Mock Connector',
  type: 'ANNOUNCED',
  chain: CommonConstantsUtil.CHAIN.EVM,
  info: { rdns: MOCK_CUSTOM_WALLET.rdns },
  provider: undefined
} as unknown as ConnectorWithProviders

describe('W3mConnectCustomWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  beforeEach(() => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything if there are no custom wallets', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: []
    })

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render custom wallets', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_CUSTOM_WALLET]
    })

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_CUSTOM_WALLET.id}`
    )
    expect(walletSelector).not.toBeNull()
    const name = walletSelector?.getAttribute('name')
    expect(name).toBe(MOCK_CUSTOM_WALLET.name)
  })

  it('should filter out wallets that are in recent wallets', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_CUSTOM_WALLET]
    })
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([MOCK_CUSTOM_WALLET])

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_CUSTOM_WALLET.id}`
    )
    expect(walletSelector).toBeNull()
  })

  it('should filter out wallets that are in connectors', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_CUSTOM_WALLET]
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_CONNECTOR]
    })

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_CUSTOM_WALLET.id}`
    )
    expect(walletSelector).toBeNull()
  })

  it('should handle MetaMask mobile RDNS special case', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_METAMASK_WALLET]
    })
    const mobileConnector: ConnectorWithProviders = {
      ...MOCK_CONNECTOR,
      info: { rdns: 'io.metamask.mobile' }
    }
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [mobileConnector]
    })

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_METAMASK_WALLET.id}`
    )
    expect(walletSelector).toBeNull()
  })

  it('should route to ConnectingWalletConnect when wallet is clicked', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_CUSTOM_WALLET]
    })
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_CUSTOM_WALLET.id}`
    )
    walletSelector?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', { wallet: MOCK_CUSTOM_WALLET })
  })

  it('should handle unknown wallet names', async () => {
    const unknownWallet: WcWallet = {
      ...MOCK_CUSTOM_WALLET,
      name: undefined
    } as unknown as WcWallet
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [unknownWallet]
    })

    const element: W3mConnectCustomWidget = await fixture(
      html`<w3m-connect-custom-widget></w3m-connect-custom-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(element, `wallet-selector-${unknownWallet.id}`)
    const name = walletSelector?.getAttribute('name')
    expect(name).toBe('Unknown')
  })
})
