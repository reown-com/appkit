import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'
import { state } from 'lit/decorators.js'
import { OptionsController } from '@reown/appkit-core'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-wallets-view')
export class W3mConnectWalletsView extends LitElement {
  public static override styles = styles

  @state() private checked = false

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legal = termsConditionsUrl || privacyPolicyUrl

    return html`
      ${this.legalCheckBoxTemplate()}
      <wui-flex
        flexDirection="column"
        .padding=${legal ? ['0', 's', 's', 's'] : 's'}
        gap="xs"
        class=${ifDefined(Boolean(legal) && !this.checked ? 'disabled' : undefined)}
      >
        <w3m-wallet-login-list></w3m-wallet-login-list>
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //

  private legalCheckBoxTemplate() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    if (!termsConditionsUrl && !privacyPolicyUrl) {
      return null
    }

    return html`<w3m-legal-checkbox
      @checkboxChange=${this.onCheckBoxChange.bind(this)}
    ></w3m-legal-checkbox>`
  }

  // -- Private Methods ----------------------------------- //

  private onCheckBoxChange(event: CustomEvent<string>) {
    this.checked = Boolean(event.detail)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallets-view': W3mConnectWalletsView
  }
}
