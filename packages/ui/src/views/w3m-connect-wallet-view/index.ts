import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-header'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
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
