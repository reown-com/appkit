import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'

@customElement('w3m-qrcode-view')
export class W3mQrCodeView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="WalletConnect"></w3m-modal-header>
      <w3m-modal-content>
        <w3m-qrcode
          size=${this.offsetWidth - 36}
          uri="wc:f022fded30dad8c2b12e8976d99935d5d2b885c07aed4fe653fc7efb0f2921dc@2?relay-protocol=irn&symKey=5a6e6cdcdda8989f67444752c36151879c20125460a1d053dcaf500b2ef724fb"
        ></w3m-qrcode>
        <button @click=${() => RouterCtrl.replace('ConnectWallet')}>Go To ConnectWallet</button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode-view': W3mQrCodeView
  }
}
