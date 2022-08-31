import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-wc-button'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [global, styles]
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
        <div class="w3m-view-row">
          <div class="w3m-view-cars">
            <w3m-wc-button .onClick=${this.onWalletConnect}></w3m-wc-button>
          </div>

          <button @click=${this.onCoinbaseWallet}>Coinbase Wallet</button>
        </div>

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
