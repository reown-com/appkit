import { ModalController, PaymasterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, css, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-payment-token-button')
export class W3mPaymentTokenButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private selectedToken = PaymasterController.state.selectedToken

  public constructor() {
    super()

    this.unsubscribe.push(
      PaymasterController.subscribe(newState => {
        this.selectedToken = newState.selectedToken
      })
    )
  }

  async handleClick() {
    await PaymasterController.getTokenList()
    ModalController.open({ view: 'PaymasterSelectToken' })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-chip-button
        @click=${this.handleClick.bind(this)}
        .text=${this.selectedToken?.symbol ?? 'Select Token'}
        icon="chevronRight"
        variant="gray"
        imageSrc=${ifDefined(this.selectedToken?.logoURI)}
      ></wui-chip-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-payment-token-button': W3mPaymentTokenButton
  }
}
