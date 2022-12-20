import { ClientCtrl, ModalCtrl, OptionsCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-walletconnect-qr')
export class W3mWalletConnectQr extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private uri = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.createConnectionAndWait()
  }

  // -- private ------------------------------------------------------ //
  private get overlayEl(): HTMLDivElement {
    return UiUtil.getShadowRootElement(this, '.w3m-qr-container') as HTMLDivElement
  }

  private async createConnectionAndWait() {
    try {
      const { standaloneUri } = OptionsCtrl.state
      if (standaloneUri) {
        setTimeout(() => (this.uri = standaloneUri), 0)
      } else {
        await ClientCtrl.client().connectWalletConnect(
          uri => (this.uri = uri),
          OptionsCtrl.state.selectedChain?.id
        )
        ModalCtrl.close()
      }
    } catch (err) {
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      this.createConnectionAndWait()
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-qr-container">
        ${this.uri
          ? html`<w3m-qrcode size="${this.overlayEl.offsetWidth}" uri=${this.uri}></w3m-qrcode>`
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
