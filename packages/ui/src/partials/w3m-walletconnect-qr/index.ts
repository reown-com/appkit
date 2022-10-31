import { ClientCtrl, ModalCtrl, ModalToastCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-qrcode'
import { global } from '../../utils/Theme'
import { getErrorMessage, getShadowRootElement } from '../../utils/UiHelpers'
import styles from './styles'

@customElement('w3m-walletconnect-qr')
export class W3mWalletConnectQr extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private uri = ''
  @state() private size = 0

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getConnectionUri()
  }

  // -- private ------------------------------------------------------ //
  private get overlayEl(): HTMLDivElement {
    return getShadowRootElement(this, '.w3m-qr-container') as HTMLDivElement
  }

  private async getConnectionUri() {
    try {
      await ClientCtrl.ethereum().connectWalletConnect(
        uri => (this.uri = uri),
        OptionsCtrl.state.selectedChainId
      )
      ModalCtrl.close()
    } catch (err) {
      ModalToastCtrl.openToast(getErrorMessage(err), 'error')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-qr-container">
        ${this.uri
          ? html`<w3m-qrcode size=${this.overlayEl.offsetWidth} uri=${this.uri}> </w3m-qrcode>`
          : null}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-walletconnect-qr': W3mWalletConnectQr
  }
}
