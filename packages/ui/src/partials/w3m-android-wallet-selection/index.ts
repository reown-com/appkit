import { ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { TemplateUtil } from '../../utils/TemplateUtil'
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

  private onGoToConnectors() {
    RouterCtrl.push('Connectors')
  }

  private onGoToGetWallet() {
    RouterCtrl.push('GetWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { recomendedWallets } = ExplorerCtrl.state
    const isRecomendedWallets = recomendedWallets.length
    const wallets = [...recomendedWallets, ...recomendedWallets]
    const connectors = TemplateUtil.externalWalletsTemplate()
    const injected = TemplateUtil.installedInjectedWalletsTemplate()
    const isConnectors = [...injected, ...connectors].length > 0

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onGoToQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        ${isRecomendedWallets
          ? html`
              <div class="w3m-slider">
                <div class="w3m-track">
                  ${wallets.map(
                    wallet =>
                      html`<w3m-wallet-image walletId=${wallet.id} imageId=${wallet.image_id}>
                      </w3m-wallet-image>`
                  )}
                </div>
              </div>
            `
          : null}

        <div class="w3m-action">
          <div>
            <w3m-button-big @click=${UiUtil.handleAndroidLinking}>
              <w3m-text color="inverse">
                ${isConnectors ? 'WalletConnect' : 'Select Wallet'}
              </w3m-text>
            </w3m-button-big>

            ${isConnectors
              ? html`<w3m-button-big @click=${this.onGoToConnectors}>
                  <w3m-text color="inverse">Other</w3m-text>
                </w3m-button-big>`
              : null}
          </div>

          <w3m-button-big variant="secondary" @click=${this.onGoToGetWallet}>
            <w3m-text variant="small-regular" color="accent">I don't have a wallet</w3m-text>
          </w3m-button-big>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-android-wallet-selection': W3mAndroidWalletSelection
  }
}
