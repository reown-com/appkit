import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'
import '../../components/w3m-text'
import { getWalletIcon } from '../../utils/Helpers'
import { DESKTOP_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

const HORIZONTAL_PADDING = 36

@customElement('w3m-coinbase-connector-view')
export class W3mCoinbaseConnectorView extends LitElement {
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
      await ClientCtrl.ethereum().connectCoinbase(uri => (this.uri = uri))
      ClientCtrl.ethereum().disconnect()
    } catch {
      throw new Error('Denied connection')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Coinbase"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-qr-container">
          ${this.uri
            ? html`<w3m-qrcode
                size=${this.offsetWidth - HORIZONTAL_PADDING}
                uri=${this.uri}
                logoSrc=${getWalletIcon('Coinbase', 'lg')}
              >
              </w3m-qrcode>`
            : null}
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>
        <w3m-text variant="large-bold">Scan with Coinbase Wallet</w3m-text>
        <w3m-text variant="medium-thin" align="center" color="secondary" class="w3m-info-text">
          Open Coinbase Wallet on your phone and scan the code to connect
        </w3m-text>
        <w3m-button
          variant="ghost"
          .iconLeft=${DESKTOP_ICON}
          .onClick=${() => RouterCtrl.replace('ConnectWallet')}
        >
          Open in Coinbase Desktop
        </w3m-button>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-coinbase-connector-view': W3mCoinbaseConnectorView
  }
}
