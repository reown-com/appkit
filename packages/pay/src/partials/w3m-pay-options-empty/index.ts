import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

import { PayController } from '../../controllers/PayController.js'
import styles from './styles.js'

@customElement('w3m-pay-options-empty')
export class W3mPayOptionsEmpty extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public selectedExchange = PayController.state.selectedExchange

  public constructor() {
    super()
    this.unsubscribe.push(
      PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val))
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const isUsingExchange = Boolean(this.selectedExchange)

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${isUsingExchange
          ? null
          : html`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `
  }

  private dispatchConnectOtherWalletEvent() {
    this.dispatchEvent(
      new CustomEvent('connectOtherWallet', {
        detail: true,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-options-empty': W3mPayOptionsEmpty
  }
}
