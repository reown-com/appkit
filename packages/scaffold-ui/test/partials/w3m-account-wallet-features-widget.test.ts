import { W3mAccountWalletFeaturesWidget } from '../../src/partials/w3m-account-wallet-features-widget'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { AccountController, CoreHelperUtil } from '@reown/appkit-core'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const WALLET_FEATURE_WIDGET_TEST_ID = 'w3m-account-wallet-features-widget'
const MOCK_ADDRESS = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'

describe('W3mAccountWalletFeaturesWidget', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: undefined
    })
  })

  it('it should not return any components if address is not provided in AccountController', () => {
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
})
