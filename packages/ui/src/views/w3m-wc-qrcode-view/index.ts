import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'
import '../../components/w3m-text'
import { COPY_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

const HORIZONTAL_PADDING = 36

@customElement('w3m-wc-qrcode-view')
export class W3mWcQrCodeView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private uri = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getConnectionUri()
  }

  // -- private ------------------------------------------------------ //
  private async getConnectionUri() {
    try {
      const data = await ClientCtrl.ethereum().connectWalletConnect(uri => (this.uri = uri))
      console.log(data)
      ClientCtrl.ethereum().disconnect()
    } catch {
      throw new Error('Denied connection')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Mobile Wallets"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-qr-container">
          ${this.uri
            ? html`<w3m-qrcode size=${this.offsetWidth - HORIZONTAL_PADDING} uri=${this.uri}>
              </w3m-qrcode>`
            : null}
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>
        <w3m-text variant="large-bold">Scan with your phone</w3m-text>
        <w3m-text variant="medium-thin" align="center" color="secondary" class="w3m-info-text">
          Open your camera app or mobile wallet and scan the code to connect
        </w3m-text>
        <w3m-button
          variant="ghost"
          .icon=${COPY_ICON}
          .onClick=${() => RouterCtrl.replace('ConnectWallet')}
        >
          Copy to Clipboard
        </w3m-button>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-qrcode-view': W3mWcQrCodeView
  }
}
