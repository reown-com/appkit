import { LitElement, html } from 'lit'

import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-pay-options-disabled')
export class W3mPayOptionsDisabled extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
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

        <wui-button
          size="md"
          variant="neutral-secondary"
          @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
          >Connect other wallet</wui-button
        >
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
    'w3m-pay-options-disabled': W3mPayOptionsDisabled
  }
}
