import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  AssetController,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  OptionsController,
  SendController
} from '@reown/appkit-controllers'

import { W3mSmartAccountSettingsView } from '../../src/views/w3m-smart-account-settings-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const ACCOUNT_TOGGLE_PREFERRED_ACCOUNT_TYPE_TEST_ID = 'account-toggle-preferred-account-type'
const ACCOUNT_TOGGLE_SMART_ACCOUNT_VERSION_TEST_ID = 'account-toggle-smart-account-version'

describe('W3mSmartAccountSettingsView', () => {
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
    const element: W3mSmartAccountSettingsView = await fixture(
      html`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`
    )
    expect(element).toBeTruthy()
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
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('AUTH')
    const setPrefSpy = vi
      .spyOn(ConnectionController, 'setPreferredAccountType')
      .mockResolvedValue(undefined)
    vi.spyOn(SendController, 'resetSend').mockImplementation(vi.fn())

    const element: W3mSmartAccountSettingsView = await fixture(
      html`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`
    )
    const toggle = HelpersUtil.getByTestId(element, ACCOUNT_TOGGLE_PREFERRED_ACCOUNT_TYPE_TEST_ID)
    toggle.click()
    expect(setPrefSpy).toHaveBeenCalled()
  })

  it('should toggle smart account version on click', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      reload: vi.fn()
    } as unknown as Location)
    const element: W3mSmartAccountSettingsView = await fixture(
      html`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`
    )
    const toggle = HelpersUtil.getByTestId(element, ACCOUNT_TOGGLE_SMART_ACCOUNT_VERSION_TEST_ID)
    toggle.click()
    expect(window.location.reload).toHaveBeenCalled()
  })
})
