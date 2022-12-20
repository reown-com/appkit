import { ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-android-wallet-selection')
export class W3mAndroidWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onGoToQrcode() {
    RouterCtrl.push('Qrcode')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { previewWallets } = ExplorerCtrl.state
    const isPreviewWallets = previewWallets.length
    const wallets = [...previewWallets, ...previewWallets]

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onGoToQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        ${isPreviewWallets
          ? html`
              <div class="w3m-slider">
                <div class="w3m-track">
                  ${wallets.map(
                    ({ image_url }) =>
                      html`<w3m-wallet-image src=${image_url.lg}></w3m-wallet-image>`
                  )}
                </div>
              </div>
            `
          : null}

        <button @click=${UiUtil.handleAndroidLinking}>
          <w3m-text variant="medium-normal" color="inverse">Select Wallet</w3m-text>
        </button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-android-wallet-selection': W3mAndroidWalletSelection
  }
}
