import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

@customElement('w3m-wallet-send-test')
export class W3mWalletSendTest extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //

  // -- State & Properties -------------------------------- //

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<p>Hello world</p>`
  }

  // -- Private ------------------------------------------- //
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-test': W3mWalletSendTest
  }
}
