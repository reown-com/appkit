import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { OptionsController, OptionsStateController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-legal-checkbox/index.js'
import '../../partials/w3m-legal-footer/index.js'
import '../../partials/w3m-social-login-list/index.js'
import styles from './styles.js'

@customElement('w3m-connect-socials-view')
export class W3mConnectSocialsView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private checked = OptionsStateController.state.isLegalCheckboxChecked

  public constructor() {
    super()
    this.unsubscribe.push(
      OptionsStateController.subscribeKey('isLegalCheckboxChecked', val => {
        this.checked = val
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const showLegalCheckbox = Boolean(legalUrl) && Boolean(legalCheckbox)

    const disabled = showLegalCheckbox && !this.checked

    const tabIndex = disabled ? -1 : undefined

    return html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${showLegalCheckbox ? ['0', 's', 's', 's'] : 's'}
        gap="xs"
        class=${ifDefined(disabled ? 'disabled' : undefined)}
      >
        <w3m-social-login-list tabIdx=${ifDefined(tabIndex)}></w3m-social-login-list>
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-socials-view': W3mConnectSocialsView
  }
}
