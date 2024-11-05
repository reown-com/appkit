import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'
import { OptionsController } from '@reown/appkit-core'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-socials-view')
export class W3mConnectSocialsView extends LitElement {
  public static override styles = styles

  @state() private checked = false

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl, enableLegalCheckbox } = OptionsController.state

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const showLegalCheckbox = Boolean(legalUrl) && Boolean(enableLegalCheckbox)

    return html`
      <w3m-legal-checkbox @checkboxChange=${this.onCheckboxChange.bind(this)}></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${showLegalCheckbox ? ['0', 's', 's', 's'] : 's'}
        gap="xs"
        class=${ifDefined(showLegalCheckbox && !this.checked ? 'disabled' : undefined)}
      >
        <w3m-social-login-list></w3m-social-login-list>
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onCheckboxChange(event: CustomEvent<string>) {
    this.checked = Boolean(event.detail)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-socials-view': W3mConnectSocialsView
  }
}
