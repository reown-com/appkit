import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-wc-button'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  // -- private ------------------------------------------------------ //
  private onWalletConnect() {
    RouterCtrl.push('WcQrCode')
  }

  private onCoinbaseWallet() {
    RouterCtrl.push('CoinbaseQrCode')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      <w3m-modal-content>
        <w3m-wc-button .onClick=${this.onWalletConnect}></w3m-wc-button>
        <button @click=${this.onCoinbaseWallet}>Coinbase Wallet</button>
        <button @click=${() => null}>Injected</button>
        <button @click=${() => RouterCtrl.replace('SelectNetwork')}>Go To Select Network</button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
