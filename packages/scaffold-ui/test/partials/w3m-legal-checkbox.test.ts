import { W3mLegalCheckbox } from '../../src/partials/w3m-legal-checkbox/index'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { OptionsController } from '@reown/appkit-core'
import { html } from 'lit'

// --- Helpers ---------------------------------------------------- //
const getTextContent = (textContent: string | null) =>
  textContent ? textContent.trim().replace('\n', '') : ''

const getWuiCheckbox = (element: HTMLElement | Element) =>
  element.shadowRoot?.querySelector('wui-checkbox') as Element

vi.mock('@reown/appkit-core', () => ({
  OptionsController: {
    state: {
      termsConditionsUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
      features: {
        legalCheckbox: true
      }
    }
  }
}))

describe('W3mLegalCheckbox', () => {
  let element: W3mLegalCheckbox

  beforeEach(async () => {
    element = await fixture(html`<w3m-legal-checkbox></w3m-legal-checkbox>`)
  })

  it('it should return checkbox if legalCheckbox is true', async () => {
    const checkbox = getWuiCheckbox(element)
    expect(checkbox).toBeDefined()
    expect(getTextContent(checkbox.textContent)).toBe(
      'I agree to our terms of service and privacy policy'
    )
  })

  it('it should not return checkbox if legalCheckbox is false', async () => {
    OptionsController.state.features!.legalCheckbox = false

    element.requestUpdate()
    await elementUpdated(element)

    expect(getWuiCheckbox(element)).toBeNull()
  })

  it('it should return checkbox if either termsConditionsUrl or privacyPolicyUrl are defined', async () => {
    OptionsController.state.features!.legalCheckbox = true
    OptionsController.state.termsConditionsUrl = 'https://example.com/terms'
    OptionsController.state.privacyPolicyUrl = undefined

    element.requestUpdate()
    await elementUpdated(element)

    const checkbox = getWuiCheckbox(element)
    expect(getWuiCheckbox).toBeDefined()
    expect(getTextContent(checkbox.textContent)).toBe('I agree to our terms of service')
  })

  it('it should not return checkbox if both termsConditionsUrl and privacyPolicyUrl are not defined', async () => {
    OptionsController.state.features!.legalCheckbox = true
    OptionsController.state.termsConditionsUrl = undefined
    OptionsController.state.privacyPolicyUrl = undefined

    element.requestUpdate()
    await elementUpdated(element)

    expect(getWuiCheckbox(element)).toBeNull()
  })
})
