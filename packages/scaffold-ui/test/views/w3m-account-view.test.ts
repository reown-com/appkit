import { W3mConnectView } from '../../src/views/w3m-connect-view/index'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  OptionsController,
  type ConnectorWithProviders,
  ConnectorController,
  CoreHelperUtil,
  AccountController,
  type AuthConnector,
  StorageUtil
} from '@reown/appkit-core'
import { ConstantsUtil } from '@reown/appkit-common'

// --- Constants ---------------------------------------------------- //
const ACCOUNT_WALLET_FEATURES_WIDGET = 'w3m-account-wallet-features-widget'
const ACCOUNT_DEFAULT_WIDGET = 'w3m-account-default-widget'

const ACCOUNT = {
  namespace: 'eip155',
  address: '0x123',
  type: 'eoa'
} as const

describe('W3mConnectView - Connection Methods', () => {
  beforeEach(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address
    })
  })

  it('should render account wallet features widget if auth connector exist and has multiple accounts', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
      ...AccountController.state,
      allAccounts: [ACCOUNT, ACCOUNT]
    })
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValueOnce(
      ConstantsUtil.CONNECTOR_ID.AUTH
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValueOnce({
      provider: {}
    } as AuthConnector)

    const element: W3mConnectView = await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(HelpersUtil.querySelect(element, ACCOUNT_WALLET_FEATURES_WIDGET)).not.toBeNull()
    expect(HelpersUtil.querySelect(element, ACCOUNT_DEFAULT_WIDGET)).toBeNull()
  })

  it('should render account default widget if auth connector does not exist', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
      ...AccountController.state,
      allAccounts: [ACCOUNT]
    })
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValueOnce(
      ConstantsUtil.CONNECTOR_ID.COINBASE
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValueOnce(undefined)

    const element: W3mConnectView = await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(HelpersUtil.querySelect(element, ACCOUNT_DEFAULT_WIDGET)).not.toBeNull()
    expect(HelpersUtil.querySelect(element, ACCOUNT_WALLET_FEATURES_WIDGET)).toBeNull()
  })

  it('should render account default widget if has no multiple accounts', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
      ...AccountController.state,
      allAccounts: []
    })
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValueOnce(
      ConstantsUtil.CONNECTOR_ID.AUTH
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValueOnce({
      provider: {}
    } as AuthConnector)

    const element: W3mConnectView = await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(HelpersUtil.querySelect(element, ACCOUNT_DEFAULT_WIDGET)).not.toBeNull()
    expect(HelpersUtil.querySelect(element, ACCOUNT_WALLET_FEATURES_WIDGET)).toBeNull()
  })
})
