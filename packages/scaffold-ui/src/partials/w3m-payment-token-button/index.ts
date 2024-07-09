import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-payment-token-button')
export class W3mPaymentTokenButton extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tokenCurrency = ''

  @property() public tokenImageUrl = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-chip-button
        .text=${this.tokenCurrency}
        icon="chevronRight"
        variant="gray"
        imageSrc=${ifDefined(this.tokenImageUrl)}
      ></wui-chip-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-payment-token-button': W3mPaymentTokenButton
  }
}
