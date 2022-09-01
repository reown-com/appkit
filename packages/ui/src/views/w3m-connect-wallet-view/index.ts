import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-wallet-button'
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
          <w3m-wc-button .onClick=${this.onWalletConnect}></w3m-wc-button>
          <w3m-wallet-button
            label="Coinbase"
            .onClick=${this.onCoinbaseWallet}
            imgUrl="https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0"
          ></w3m-wallet-button>
        </div>

        <button @click=${() => null}>Injected</button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
