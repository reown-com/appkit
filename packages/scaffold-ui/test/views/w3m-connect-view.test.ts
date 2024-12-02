import { W3mConnectView } from '../../src/views/w3m-connect-view/index'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import { OptionsController } from '@reown/appkit-core'

// --- Constants ---------------------------------------------------- //
const CONNECT_SCROLL_VIEW_TEST_ID = 'w3m-connect-scroll-view'

vi.mock('@reown/appkit-core', async importOriginal => {
  const actual = await importOriginal<typeof import('@reown/appkit-core')>()

  return {
    ...actual,
    OptionsController: {
      ...actual.OptionsController,
      state: {
        connectors: [],
        termsConditionsUrl: 'https://example.com/terms',
        privacyPolicyUrl: 'https://example.com/privacy',
        features: {
          legalCheckbox: true
        }
      }
    }
  }
})

describe('W3mConnectView', () => {
  let element: W3mConnectView

  beforeEach(async () => {
    element = await fixture(html`<w3m-connect-view></w3m-connect-view>`)
  })

  it('it should disable connect view if legal checkbox is enabled', async () => {
    const connectScrollView = HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID)

    expect(connectScrollView).toBeDefined()
    expect(HelpersUtil.getClasses(connectScrollView)).toStrictEqual(['connect', 'disabled'])
  })

  it('it should enable connect view if legal checkbox is disabled', async () => {
    OptionsController.state.features!.legalCheckbox = false
    const connectScrollView = HelpersUtil.getByTestId(element, CONNECT_SCROLL_VIEW_TEST_ID)

    expect(connectScrollView).toBeDefined()

    element.requestUpdate()
    await elementUpdated(element)

    expect(HelpersUtil.getClasses(connectScrollView)).toStrictEqual(['connect'])
  })
})
