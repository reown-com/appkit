import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import RouterCtrl from '../../controllers/RouterCtrl'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        Connect Wallet View
        <button @click=${() => RouterCtrl.replace('SelectNetwork')}>Go To Select Network</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
