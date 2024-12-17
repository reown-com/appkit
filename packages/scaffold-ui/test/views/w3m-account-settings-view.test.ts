import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AccountController,
  AssetController,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  StorageUtil,
  type AccountControllerState,
  type AssetControllerState,
  type ChainControllerState
} from '@reown/appkit-core'
import { W3mFrameProvider, W3mFrameRpcConstants } from '@reown/appkit-wallet'
import type { CaipNetwork } from '@reown/appkit-common'
import type { W3mAccountSettingsView } from '../../exports'

describe('W3mAccountSettingsView', () => {
  const mockAddress = '0x123'
  const mockNetwork = {
    id: '1',
    name: 'Ethereum',
    chainNamespace: 'eip155',
    assets: { imageId: 'ethereum' }
  } as unknown as CaipNetwork
  const mockAuthConnector = {
    id: 'ID_AUTH',
    chain: 'eip155' as const,
    type: 'AUTH' as const,
    provider: {
      setPreferredAccountType: () => {},
      getEmail: () => 'test@test.com'
    } as unknown as W3mFrameProvider
  }

  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: mockAddress,
      profileImage: 'profile.jpg',
      profileName: 'Test Account',
      preferredAccountType: 'eoa'
    } as AccountControllerState)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: mockNetwork
    } as ChainControllerState)

    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      networkImages: { ethereum: 'eth.png' }
    } as unknown as AssetControllerState)

    vi.spyOn(ConnectionController, 'setPreferredAccountType').mockImplementation(async () => {
      AccountController.setPreferredAccountType('smartAccount', 'eip155')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('copies address when copy button is clicked', async () => {
    const copyToClipboardSpy = vi.spyOn(CoreHelperUtil, 'copyToClipboard')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const copyButton = HelpersUtil.querySelect(element, 'wui-icon-link')
    copyButton?.click()

    expect(copyToClipboardSpy).toHaveBeenCalledWith(mockAddress)
  })

  it('shows upgrade card for auth connector', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    expect(HelpersUtil.querySelect(element, '[data-testid="w3m-wallet-upgrade-card"]')).toBeTruthy()
  })

  it('does not show upgrade card for non-auth connector', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ANNOUNCED')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    expect(HelpersUtil.querySelect(element, '[data-testid="w3m-wallet-upgrade-card"]')).toBeFalsy()
  })

  it('navigates to networks when network switch is allowed', async () => {
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([
      mockNetwork,
      { id: '2', name: 'Polygon' } as unknown as CaipNetwork
    ])
    const routerSpy = vi.spyOn(RouterController, 'push')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const networkButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-switch-network-button"]'
    )
    networkButton?.click()

    expect(routerSpy).toHaveBeenCalledWith('Networks')
  })

  it('shows choose name button when conditions are met', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(ChainController, 'checkIfNamesSupported').mockReturnValue(true)
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      profileName: null
    })

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const nameButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-choose-name-button"]'
    )
    expect(nameButton).toBeTruthy()
  })

  it('does not show choose name button when theres no network', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: undefined
    } as ChainControllerState)

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const nameButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-choose-name-button"]'
    )
    expect(nameButton).toBeFalsy()
  })

  it('does not show choose name button when connector is not auth', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ANNOUNCED')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const nameButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-choose-name-button"]'
    )
    expect(nameButton).toBeFalsy()
  })

  it('does not show choose name button when profile name is already set', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      profileName: 'Test Account'
    })

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const nameButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-choose-name-button"]'
    )
    expect(nameButton).toBeFalsy()
  })

  it('doeos not show choose name button when network does not support names', async () => {
    vi.spyOn(ChainController, 'checkIfNamesSupported').mockReturnValue(false)

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const nameButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-choose-name-button"]'
    )
    expect(nameButton).toBeFalsy()
  })

  it('shows preferred account type toggle for smart account', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(true)

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const toggleButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-toggle-preferred-account-type"]'
    )
    expect(toggleButton).toBeTruthy()
  })

  it('does not show preferred account type toggle for non-smart account', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(false)

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const toggleButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-toggle-preferred-account-type"]'
    )
    expect(toggleButton).toBeFalsy()
  })

  it('toggles preferred account type', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(true)

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const toggleButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-toggle-preferred-account-type"]'
    )
    await toggleButton?.click()

    expect(ConnectionController.setPreferredAccountType).toHaveBeenCalledWith(
      W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    )

    element.requestUpdate()
    await elementUpdated(element)

    const updatedToggleButton = HelpersUtil.querySelect(
      element,
      '[data-testid="account-toggle-preferred-account-type"]'
    )

    expect(HelpersUtil.getTextContent(updatedToggleButton)).toBe('Switch to your EOA')
  })

  it('disconnects wallet and closes modal', async () => {
    const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const disconnectButton = HelpersUtil.querySelect(element, '[data-testid="disconnect-button"]')
    await disconnectButton?.click()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('navigates to upgrade view when upgrade card is clicked', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

    const routerSpy = vi.spyOn(RouterController, 'push')

    const element = await fixture(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    const upgradeCard = HelpersUtil.querySelect(element, '[data-testid="w3m-wallet-upgrade-card"]')
    upgradeCard?.click()

    expect(routerSpy).toHaveBeenCalledWith('UpgradeEmailWallet')
  })
})
