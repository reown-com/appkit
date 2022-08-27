import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'

const HORIZONTAL_PADDING = 36

@customElement('w3m-wc-qrcode-view')
export class W3mWcQrCodeView extends LitElement {
  @state() private uri = ''

  public constructor() {
    super()

    this.onConnectCallback()
  }

  private setUri(uri: string) {
    this.uri = uri
  }

  private async onConnectCallback() {
    try {
      await ClientCtrl.state.ethereum?.connectWalletConnect({
        onDisplayUri: this.setUri
      })
    } catch {
      throw new Error('Denied connection')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Mobile Wallets"></w3m-modal-header>
      <w3m-modal-content>
        ${this.uri
          ? html`<w3m-qrcode size=${this.offsetWidth - HORIZONTAL_PADDING} uri=${this.uri}>
            </w3m-qrcode>`
          : null}
        <button @click=${() => RouterCtrl.replace('ConnectWallet')}>Go To ConnectWallet</button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-qrcode-view': W3mWcQrCodeView
  }
}
