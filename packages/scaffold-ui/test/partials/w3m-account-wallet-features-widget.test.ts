import { W3mAccountWalletFeaturesWidget } from '../../src/partials/w3m-account-wallet-features-widget'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { AccountController, CoreHelperUtil, RouterController } from '@reown/appkit-core'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const WALLET_FEATURE_WIDGET_TEST_ID = 'w3m-account-wallet-features-widget'
const MOCK_ADDRESS = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'
const PROFILE_BUTTON = 'w3m-profile-button'

const ACCOUNT = {
  namespace: 'eip155',
  address: '0x123',
  type: 'eoa'
} as const

describe('W3mAccountWalletFeaturesWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should not return any components if address is not provided in AccountController', () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: undefined
    })
    expect(() =>
      fixture(html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`)
    ).rejects.toThrow('w3m-account-view: No account provided')
  })

  it('it should return all components if address is provided in AccountsController', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: MOCK_ADDRESS
    })

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.getByTestId(element, WALLET_FEATURE_WIDGET_TEST_ID)).not.toBeNull()
  })

  it('should redirect to AccountSettings view if has one account', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address
    })
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address,
      allAccounts: [ACCOUNT]
    })

    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    const profileButton = HelpersUtil.getByTestId(element, PROFILE_BUTTON)

    expect(profileButton).not.toBeNull()

    const button = HelpersUtil.querySelect(profileButton, 'button')

    button.click()

    expect(pushSpy).toHaveBeenCalledWith('AccountSettings')
  })

  it('should redirect to Profile view if has more than one account', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address
    })
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: ACCOUNT.address,
      allAccounts: [ACCOUNT, ACCOUNT]
    })

    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mAccountWalletFeaturesWidget = await fixture(
      html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
    )

    const profileButton = HelpersUtil.getByTestId(element, PROFILE_BUTTON)

    expect(profileButton).not.toBeNull()

    const button = HelpersUtil.querySelect(profileButton, 'button')

    button.click()

    expect(pushSpy).toHaveBeenCalledWith('Profile')
  })
})
