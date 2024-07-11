import { ModalController, PaymasterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, css, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-payment-token-button')
export class W3mPaymentTokenButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `

  // -- State & Properties -------------------------------- //
  @property() public tokenCurrency = ''

  @property() public tokenImageUrl = ''

  async handleClick() {
    await PaymasterController.getTokenList()
    ModalController.open({ view: 'PaymasterSelectToken' })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-chip-button
        @click=${this.handleClick.bind(this)}
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
