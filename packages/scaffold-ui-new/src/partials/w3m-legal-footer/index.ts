import { OptionsController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

@customElement('w3m-legal-footer')
export class W3mLegalFooter extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    if (!termsConditionsUrl && !privacyPolicyUrl) {
      return null
    }

    if (legalCheckbox) {
      return null
    }

    return html`
      <wui-flex
        .padding=${['3', '4', '3', '4']}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="3"
      >
        <wui-text color="tertiary" variant="sm-regular" align="center">
          By connecting your wallet, you agree to our <br />
          ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
        </wui-text>
        <wui-powered-by></wui-powered-by>
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

    return html`<a rel="noreferrer" target="_blank" href=${termsConditionsUrl}>Terms of Service</a>`
  }

  private privacyTemplate() {
    const { privacyPolicyUrl } = OptionsController.state
    if (!privacyPolicyUrl) {
      return null
    }

    return html`<a rel="noreferrer" target="_blank" href=${privacyPolicyUrl}>Privacy Policy</a>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-footer': W3mLegalFooter
  }
}
