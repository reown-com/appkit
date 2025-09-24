import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  type Connection
} from '@reown/appkit-common'
import {
  type AccountState,
  AssetController,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  SendController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mAccountSettingsView } from '../../src/views/w3m-account-settings-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const ACCOUNT_SWITCH_NETWORK_BUTTON_TEST_ID = 'account-switch-network-button'
const ACCOUNT_CHOOSE_NAME_BUTTON_TEST_ID = 'account-choose-name-button'
const ACCOUNT_TOGGLE_PREFERRED_ACCOUNT_TYPE_TEST_ID = 'account-toggle-preferred-account-type'
const DISCONNECT_BUTTON_TEST_ID = 'disconnect-button'
const WALLET_UPGRADE_CARD_TEST_ID = 'w3m-wallet-upgrade-card'

describe('W3mAccountSettingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      address: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
    } as unknown as AccountState)
    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      networkImages: {}
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: { id: 1, name: 'Ethereum', chainNamespace: 'eip155' }
    } as never)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined as never)
  })

  it('should render', async () => {
    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should throw when no account provided', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      address: undefined
    } as unknown as AccountState)
    await expect(
      fixture<W3mAccountSettingsView>(html`<w3m-account-settings-view></w3m-account-settings-view>`)
    ).rejects.toThrowError(/No account provided/)
  })

  it('should copy address and show success on copy icon click', async () => {
    const copySpy = vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(() => {})
    const successSpy = vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const copyBtn = element.shadowRoot?.querySelector('wui-icon-link') as HTMLElement
    copyBtn?.click()
    expect(copySpy).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith('Address copied')
  })

  it('should push Networks when switching network is allowed', async () => {
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([
      { id: 1 } as CaipNetwork,
      { id: 10 } as CaipNetwork
    ])
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const button = HelpersUtil.getByTestId(element, ACCOUNT_SWITCH_NETWORK_BUTTON_TEST_ID)
    button?.click()
    expect(pushSpy).toHaveBeenCalledWith('Networks')
  })

  it('should render choose name button when supported and navigate on click', async () => {
    vi.spyOn(ChainController, 'checkIfNamesSupported').mockReturnValue(true)
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      provider: { getEmail: vi.fn().mockReturnValue('user@example.com') }
    } as unknown as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const choose = HelpersUtil.getByTestId(element, ACCOUNT_CHOOSE_NAME_BUTTON_TEST_ID)
    expect(choose).toBeTruthy()
    choose?.click()
    expect(pushSpy).toHaveBeenCalledWith('ChooseAccountName')
  })

  it('should show upgrade card when eligible and navigate on click', async () => {
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      provider: { getEmail: vi.fn().mockReturnValue('user@example.com') }
    } as unknown as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )
    Object.defineProperty(global, 'location', {
      value: { origin: 'https://example.com' }
    })
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const card = HelpersUtil.getByTestId(element, WALLET_UPGRADE_CARD_TEST_ID)
    expect(card).toBeTruthy()
    card?.click()
    expect(pushSpy).toHaveBeenCalledWith('UpgradeEmailWallet')
  })

  it('should toggle preferred account type on click', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      address: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678',
      preferredAccountType: 'smartAccount'
    } as AccountState)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(true)
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      provider: { getEmail: vi.fn().mockReturnValue('user@example.com') }
    } as unknown as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('ID_AUTH')
    const setPrefSpy = vi
      .spyOn(ConnectionController, 'setPreferredAccountType')
      .mockResolvedValue(undefined)
    vi.spyOn(SendController, 'resetSend').mockImplementation(vi.fn())

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const toggle = HelpersUtil.getByTestId(element, ACCOUNT_TOGGLE_PREFERRED_ACCOUNT_TYPE_TEST_ID)
    toggle.click()
    expect(setPrefSpy).toHaveBeenCalled()
  })

  it('should disconnect and navigate to ProfileWallets for multi-wallet', async () => {
    vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([{}] as Connection[])
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: { eip155: 'wc' } as unknown as Record<ChainNamespace, string | undefined>
    })
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
    const successSpy = vi.spyOn(SnackController, 'showSuccess').mockImplementation(vi.fn())
    vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)

    const element: W3mAccountSettingsView = await fixture(
      html`<w3m-account-settings-view></w3m-account-settings-view>`
    )
    const disconnectBtn = HelpersUtil.getByTestId(element, DISCONNECT_BUTTON_TEST_ID)
    disconnectBtn?.click()

    await vi.waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('ProfileWallets')
      expect(successSpy).toHaveBeenCalledWith('Wallet deleted')
    })
  })
})
