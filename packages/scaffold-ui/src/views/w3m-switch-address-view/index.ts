import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AccountController, type AccountType, OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-avatar'
import '@reown/appkit-ui/wui-banner-img'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-switch-address-view')
export class W3mSwitchAddressView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata

  @state() private balances: Record<string, number> = {}

  public readonly labels = AccountController.state.addressLabels

  public readonly currentAddress: string = AccountController.state.address || ''

  private caipNetwork = ChainController.state.activeCaipNetwork

  public override connectedCallback() {
    super.connectedCallback()
  }

  public getAddressIcon(type: AccountType['type']) {
    if (type === 'smartAccount') {
      return 'lightbulb'
    }

    return 'mail'
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
        <wui-banner-img
          imageSrc=${ifDefined(this.metadata?.icons[0])}
          text=${ifDefined(this.metadata?.url)}
          size="sm"
        ></wui-banner-img>
      </wui-flex>
      <wui-flex flexDirection="column" gap="xxl" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-address-view': W3mSwitchAddressView
  }
}
