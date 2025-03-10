import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import {
  type AuthConnector,
  ConnectorController,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'

import { W3mAccountAuthButton } from '../../src/partials/w3m-account-auth-button'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const ACCOUNT_EMAIL = 'w3m-account-email-update'
const MOCK_EMAIL = 'example@gmail.com'
const MOCK_USERNAME = 'john_doe'

describe('W3mAccountAuthButton', () => {
  beforeEach(() => {
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('ID_AUTH')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('it should show email when username does not exist', async () => {
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: 'ID_AUTH',
      provider: {
        getEmail: () => MOCK_EMAIL
      }
    } as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('ID_AUTH')

    const authButton: W3mAccountAuthButton = await fixture(
      html`<w3m-account-auth-button></w3m-account-auth-button>`
    )
    const accountEmail = HelpersUtil.getByTestId(authButton, ACCOUNT_EMAIL)

    expect(accountEmail).not.toBeNull()
    expect(HelpersUtil.getTextContent(accountEmail)).toBe(MOCK_EMAIL)
  })

  test('it should show username when email does not exist', async () => {
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue(MOCK_USERNAME)
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: 'ID_AUTH',
      provider: {
        getEmail: () => null
      }
    } as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('ID_AUTH')

    const authButton: W3mAccountAuthButton = await fixture(
      html`<w3m-account-auth-button></w3m-account-auth-button>`
    )
    const accountEmail = HelpersUtil.getByTestId(authButton, ACCOUNT_EMAIL)

    expect(accountEmail).not.toBeNull()
    expect(HelpersUtil.getTextContent(accountEmail)).toBe(MOCK_USERNAME)
  })

  test('it should navigate to update email view screen when email button is clicked without a social provider', async () => {
    vi.spyOn(RouterController, 'push')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: 'ID_AUTH',
      provider: {
        getEmail: () => MOCK_EMAIL
      }
    } as AuthConnector)
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('ID_AUTH')

    const authButton: W3mAccountAuthButton = await fixture(
      html`<w3m-account-auth-button></w3m-account-auth-button>`
    )
    const accountEmail = HelpersUtil.getByTestId(authButton, ACCOUNT_EMAIL)

    expect(accountEmail).not.toBeNull()

    accountEmail?.click()

    expect(RouterController.push).toHaveBeenCalledWith('UpdateEmailWallet', { email: MOCK_EMAIL })
  })
})
