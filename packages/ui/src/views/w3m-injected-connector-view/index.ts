import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'
import { global } from '../../utils/Theme'
import styles from './styles'

const HORIZONTAL_PADDING = 36

@customElement('w3m-injected-connector-view')
export class W3mInjectedConnectorView extends LitElement {
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
            ? html`<w3m-qrcode size=${this.offsetWidth - HORIZONTAL_PADDING} uri=${this.uri}>
              </w3m-qrcode>`
            : null}
        </div>
      </w3m-modal-content>
      <button @click=${() => RouterCtrl.replace('ConnectWallet')}>Go To ConnectWallet</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-injected-connector-view': W3mInjectedConnectorView
  }
}
