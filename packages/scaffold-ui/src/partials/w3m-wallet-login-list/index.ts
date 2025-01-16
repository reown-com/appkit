import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { customElement } from '@reown/appkit-ui'

@customElement('w3m-wallet-login-list')
export class W3mWalletLoginList extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="xs">
        <w3m-connector-list tabIdx=${ifDefined(this.tabIdx)}></w3m-connector-list>
        <w3m-all-wallets-widget tabIdx=${ifDefined(this.tabIdx)}></w3m-all-wallets-widget>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-login-list': W3mWalletLoginList
  }
}
