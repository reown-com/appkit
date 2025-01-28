import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { OptionsController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-legal-checkbox/index.js'
import '../../partials/w3m-legal-footer/index.js'
import '../../partials/w3m-wallet-login-list/index.js'
import styles from './styles.js'

@customElement('w3m-connect-wallets-view')
export class W3mConnectWalletsView extends LitElement {
  public static override styles = styles

  @state() private checked = false

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const showLegalCheckbox = Boolean(legalUrl) && Boolean(legalCheckbox)

    const disabled = showLegalCheckbox && !this.checked

    const tabIndex = disabled ? -1 : undefined

    return html`
      <w3m-legal-checkbox @checkboxChange=${this.onCheckboxChange.bind(this)}></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${showLegalCheckbox ? ['0', 's', 's', 's'] : 's'}
        gap="xs"
        class=${ifDefined(disabled ? 'disabled' : undefined)}
      >
        <w3m-wallet-login-list tabIdx=${ifDefined(tabIndex)}></w3m-wallet-login-list>
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
    'w3m-connect-wallets-view': W3mConnectWalletsView
  }
}
