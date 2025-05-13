import { LitElement, html } from 'lit'

import { OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-ux-by-reown'

import styles from './styles.js'

@customElement('w3m-legal-footer')
export class W3mLegalFooter extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox
    const showOnlyBranding = (!termsConditionsUrl && !privacyPolicyUrl) || legalCheckbox

    if (showOnlyBranding) {
      return html`
        <wui-flex flexDirection="column">
          <wui-ux-by-reown class="branding-only"></wui-ux-by-reown>
        </wui-flex>
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
        <wui-ux-by-reown></wui-ux-by-reown>
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

    return html`<a href=${termsConditionsUrl}>Terms of Service</a>`
  }

  private privacyTemplate() {
    const { privacyPolicyUrl } = OptionsController.state
    if (!privacyPolicyUrl) {
      return null
    }

    return html`<a href=${privacyPolicyUrl}>Privacy Policy</a>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-footer': W3mLegalFooter
  }
}
