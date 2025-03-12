import { LitElement, html } from 'lit'

import { OptionsController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-checkbox'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-legal-checkbox')
export class W3mLegalCheckbox extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    if (!termsConditionsUrl && !privacyPolicyUrl) {
      return null
    }

    if (!legalCheckbox) {
      return null
    }

    return html`
      <wui-checkbox data-testid="wui-checkbox">
        <wui-text color="fg-250" variant="small-400" align="left">
          I agree to our ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
        </wui-text>
      </wui-checkbox>
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

    return html`<a rel="noreferrer" target="_blank" href=${termsConditionsUrl}>terms of service</a>`
  }

  private privacyTemplate() {
    const { privacyPolicyUrl } = OptionsController.state

    if (!privacyPolicyUrl) {
      return null
    }

    return html`<a rel="noreferrer" target="_blank" href=${privacyPolicyUrl}>privacy policy</a>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-checkbox': W3mLegalCheckbox
  }
}
