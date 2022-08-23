import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        Connect Wallet View <br />
        Connect Wallet View <br />
        Connect Wallet View <br />
        Connect Wallet View <br />
        Connect Wallet View <br />
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
