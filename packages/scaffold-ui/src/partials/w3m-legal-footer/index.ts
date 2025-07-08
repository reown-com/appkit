import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-ux-by-reown'

import styles from './styles.js'

@customElement('w3m-legal-footer')
export class W3mLegalFooter extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()
    this.unsubscribe.push(
      OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox
    const showOnlyBranding = (!termsConditionsUrl && !privacyPolicyUrl) || legalCheckbox

    if (showOnlyBranding) {
      return html`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(true)} </wui-flex>
      `
    }

    return html`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${['m', 's', 's', 's'] as const} justifyContent="center">
          <wui-text color="fg-250" variant="small-400" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private andTemplate() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    return termsConditionsUrl && privacyPolicyUrl ? 'and' : ''
  }

  private termsTemplate() {
    const { termsConditionsUrl } = OptionsController.state
    if (!termsConditionsUrl) {
      return null
    }

    return html`<a 
      href=${termsConditionsUrl}
      target="_blank"
      rel="noopener noreferrer"
    >Terms of Service</a>`
  }

  private privacyTemplate() {
    const { privacyPolicyUrl } = OptionsController.state
    if (!privacyPolicyUrl) {
      return null
    }

    return html`<a 
      href=${privacyPolicyUrl}
      target="_blank"
      rel="noopener noreferrer"
    >Privacy Policy</a>`
  }

  private reownBrandingTemplate(showOnlyBranding = false) {
    if (!this.remoteFeatures?.reownBranding) {
      return null
    }

    if (showOnlyBranding) {
      return html`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`
    }

    return html`<wui-ux-by-reown></wui-ux-by-reown>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-footer': W3mLegalFooter
  }
}
