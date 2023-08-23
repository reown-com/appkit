import { CoreUtil, ExplorerCtrl, RouterCtrl } from '@web3modal/core'
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

  private onGetWallet() {
    RouterCtrl.push('GetWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { recomendedWallets } = ExplorerCtrl.state
    const wallets = [...recomendedWallets, ...recomendedWallets]
    const external = TemplateUtil.externalWalletsTemplate()
    const injected = TemplateUtil.installedInjectedWalletsTemplate()
    const isOther = [...injected, ...external].length > 0
    const recomendedCount = CoreUtil.RECOMMENDED_WALLET_AMOUNT * 2

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onGoToQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-title">
          ${SvgUtil.MOBILE_ICON}
          <w3m-text variant="small-regular" color="accent">WalletConnect</w3m-text>
        </div>

        <div class="w3m-slider">
          <div class="w3m-track">
            ${[...Array(recomendedCount)].map((_, index) => {
              const wallet = wallets[index % wallets.length]

              return wallet
                ? html`<w3m-wallet-image
                    walletId=${wallet.id}
                    imageId=${wallet.image_id}
                  ></w3m-wallet-image>`
                : SvgUtil.WALLET_PLACEHOLDER
            })}
          </div>
          <w3m-button-big
            @click=${UiUtil.handleAndroidLinking}
            data-testid="partial-android-wallet-button"
          >
            <w3m-text variant="medium-regular" color="inverse">Select Wallet</w3m-text>
          </w3m-button-big>
        </div>
      </w3m-modal-content>

      ${isOther
        ? html`
            <w3m-modal-footer data-testid="partial-android-footer">
              <div class="w3m-title">
                ${SvgUtil.WALLET_ICON}
                <w3m-text variant="small-regular" color="accent">Other</w3m-text>
              </div>

              <div class="w3m-grid">${injected} ${external}</div>
            </w3m-modal-footer>
          `
        : null}

      <w3m-info-footer>
        <w3m-text color="secondary" variant="small-thin">
          ${`Choose WalletConnect to see supported apps on your device${
            isOther ? ', or select from other options' : ''
          }`}
        </w3m-text>

        <w3m-button
          variant="outline"
          .iconRight=${SvgUtil.ARROW_UP_RIGHT_ICON}
          .onClick=${() => this.onGetWallet()}
          data-testid="partial-android-nowallet-button"
          >I don't have a wallet</w3m-button
        >
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-android-wallet-selection': W3mAndroidWalletSelection
  }
}
