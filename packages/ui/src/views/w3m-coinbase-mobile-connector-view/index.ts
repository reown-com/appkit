import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-coinbase-mobile-connector-view')
export class W3mCoinbaseMobileConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private uri = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getConnectionUri()
  }

  // -- private ------------------------------------------------------ //
  private get overlayEl(): HTMLDivElement {
    return UiUtil.getShadowRootElement(this, '.w3m-qr-container') as HTMLDivElement
  }

  private readonly coinbaseWalletUrl = 'https://www.coinbase.com/wallet'

  private async getConnectionUri() {
    try {
      await ClientCtrl.client().connectCoinbaseMobile(
        uri => (this.uri = uri),
        OptionsCtrl.state.selectedChainId
      )
      ModalCtrl.close()
    } catch (err) {
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
    }
  }

  private onInstall() {
    CoreUtil.openHref(this.coinbaseWalletUrl, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const name = 'Coinbase Wallet'

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-qr-container">
          ${this.uri
            ? html`
                <w3m-qrcode
                  size=${this.overlayEl.offsetWidth}
                  uri=${this.uri}
                  walletId="coinbaseWallet"
                >
                </w3m-qrcode>
              `
            : null}
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>
        <div class="w3m-footer">
          <div class="w3m-title">
            ${SvgUtil.QRCODE_ICON}
            <w3m-text variant="medium-normal">Scan with your phone</w3m-text>
          </div>
          <w3m-text variant="small-thin" align="center" color="secondary" class="w3m-info-text">
            Open Coinbase Wallet on your phone and scan the code to connect
          </w3m-text>
          <w3m-button .iconLeft=${SvgUtil.ARROW_DOWN_ICON} .onClick=${this.onInstall.bind(this)}>
            Install Extension
          </w3m-button>
        </div>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-coinbase-mobile-connector-view': W3mCoinbaseMobileConnectorView
  }
}
