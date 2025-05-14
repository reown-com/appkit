import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { OptionsController } from '@reown/appkit-controllers'

import { W3mLegalFooter } from '../../src/partials/w3m-legal-footer'

describe('W3mLegalFooter', () => {
  let element: W3mLegalFooter

  beforeEach(() => {
    element = document.createElement('w3m-legal-footer') as W3mLegalFooter
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('renders branding when legalCheckbox is enabled and URLs are set', async () => {
    const originalState = { ...OptionsController.state }
    try {
      OptionsController.state = {
        ...OptionsController.state,
        termsConditionsUrl: 'https://example.com/terms',
        privacyPolicyUrl: 'https://example.com/privacy',
        features: {
          ...OptionsController.state.features,
          legalCheckbox: true
        }
      }

      await element.updateComplete
      const flexElement = element.shadowRoot?.querySelector('wui-flex')

      expect(flexElement).toBeDefined()
      const brandingElement = flexElement?.querySelector('wui-ux-by-reown')
      expect(brandingElement).toBeDefined()
    } finally {
      OptionsController.state = originalState
    }
  })

  it('renders branding when no URLs are set', async () => {
    const originalState = { ...OptionsController.state }
    try {
      OptionsController.state = {
        ...OptionsController.state,
        termsConditionsUrl: '',
        privacyPolicyUrl: '',
        features: {
          ...OptionsController.state.features,
          legalCheckbox: false
        }
      }

      await element.updateComplete
      const flexElement = element.shadowRoot?.querySelector('wui-flex')

      expect(flexElement).toBeDefined()
      const brandingElement = flexElement?.querySelector('wui-ux-by-reown')
      expect(brandingElement).toBeDefined()
    } finally {
      OptionsController.state = originalState
    }
  })

  it('renders legal text and branding when URLs are set and legalCheckbox is disabled', async () => {
    const originalState = { ...OptionsController.state }
    try {
      OptionsController.state = {
        ...OptionsController.state,
        termsConditionsUrl: 'https://example.com/terms',
        privacyPolicyUrl: 'https://example.com/privacy',
        features: {
          ...OptionsController.state.features,
          legalCheckbox: false
        }
      }

      await element.updateComplete
      const flexElement = element.shadowRoot?.querySelector('wui-flex')

      expect(flexElement).toBeDefined()
      const textElement = flexElement?.querySelector('wui-text')
      expect(textElement).toBeDefined()
      const brandingElement = flexElement?.querySelector('wui-ux-by-reown')
      expect(brandingElement).toBeDefined()
    } finally {
      OptionsController.state = originalState
    }
  })
})
