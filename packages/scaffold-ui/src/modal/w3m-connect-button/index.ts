import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { WuiConnectButton } from '@reown/appkit-ui'

@customElement('w3m-connect-button')
export class W3mConnectButton extends LitElement {
  @property() public size?: WuiConnectButton['size'] = 'md'
  @property() public label? = 'Connect Wallet'
  @property() public loadingLabel? = 'Connecting...'

  public override render() {
    return html`
      <appkit-connect-button
        size=${ifDefined(this.size)}
        label=${ifDefined(this.label)}
        loadingLabel=${ifDefined(this.loadingLabel)}
      ></appkit-connect-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
