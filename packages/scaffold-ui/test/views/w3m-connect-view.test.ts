import { W3mConnectView } from '../../src/views/w3m-connect-view/index'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import { OptionsController } from '@reown/appkit-core'

// --- Constants ---------------------------------------------------- //
const CONNECT_SCROLL_VIEW_TEST_ID = 'w3m-connect-scroll-view'

const TERMS_CONDITIONS_URL = 'https://example.com/terms'
const PRIVACY_POLICY_URL = 'https://example.com/privacy'

describe('W3mConnectView', () => {
  beforeAll(() => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: TERMS_CONDITIONS_URL,
      privacyPolicyUrl: PRIVACY_POLICY_URL,
      features: {
        legalCheckbox: true
      }
    })
  })

  it('it should disable connect view if legal checkbox is enabled', async () => {
    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const connectScrollView = HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID)

    expect(connectScrollView).not.toBeNull()
    expect(HelpersUtil.getClasses(connectScrollView)).toStrictEqual(['connect', 'disabled'])
  })

  it('it should enable connect view if legal checkbox is disabled', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        legalCheckbox: false
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const connectScrollView = HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID)

    expect(connectScrollView).not.toBeNull()

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.getClasses(connectScrollView)).toStrictEqual(['connect'])
  })

  it('should listen for checkboxChange event and enable connect view after checkbox is clicked', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        legalCheckbox: true
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    expect(
      HelpersUtil.getClasses(HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID))
    ).toStrictEqual(['connect', 'disabled'])

    const w3mLegalCheckbox = HelpersUtil.querySelect(element, 'w3m-legal-checkbox')
    const wuiLegalCheckbox = HelpersUtil.querySelect(w3mLegalCheckbox, 'wui-checkbox')
    const labelWuiLegalCheckbox = HelpersUtil.querySelect(wuiLegalCheckbox, 'label')

    const checkboxChange = vi.fn()

    w3mLegalCheckbox?.addEventListener('checkboxChange', checkboxChange)

    // Click checkbox
    labelWuiLegalCheckbox?.click()

    element.requestUpdate()
    await elementUpdated(element)

    // Disabled class is removed after checkbox click
    expect(
      HelpersUtil.getClasses(HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID))
    ).toStrictEqual(['connect'])

    expect(checkboxChange).toHaveBeenCalled()
  })
})
