import { CoreUtil, ExplorerCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataUtil } from '../../utils/DataUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onGet(url: string) {
    CoreUtil.openHref(url, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const recomendedWallets = ExplorerCtrl.state.recomendedWallets.slice(0, 5)
    const manualWallets = DataUtil.manualWallets().slice(0, 5)
    const isRecomendedWallets = recomendedWallets.length
    const isCustomWallets = manualWallets.length

    return html`
      <w3m-modal-header
        title="Get a wallet"
        data-testid="view-get-wallet-header"
      ></w3m-modal-header>
      <w3m-modal-content data-testid="view-get-wallet-content">
        ${isRecomendedWallets
          ? recomendedWallets.map(
              wallet => html`
                <div class="w3m-wallet-item" data-testid="view-get-wallet-${wallet.id}">
                  <w3m-wallet-image walletId=${wallet.id} imageId=${wallet.image_id}>
                  </w3m-wallet-image>
                  <div class="w3m-wallet-content">
                    <w3m-text variant="medium-regular">${wallet.name}</w3m-text>
                    <w3m-button
                      .iconRight=${SvgUtil.ARROW_RIGHT_ICON}
                      .onClick=${() => this.onGet(wallet.homepage)}
                      data-testid="view-get-wallet-button-${wallet.id}"
                    >
                      Get
                    </w3m-button>
                  </div>
                </div>
              `
            )
          : null}
        ${isCustomWallets
          ? manualWallets.map(
              wallet => html`
                <div class="w3m-wallet-item" data-testid="view-get-wallet-${wallet.id}">
                  <w3m-wallet-image walletId=${wallet.id}></w3m-wallet-image>
                  <div class="w3m-wallet-content">
                    <w3m-text variant="medium-regular">${wallet.name}</w3m-text>
                    <w3m-button
                      .iconRight=${SvgUtil.ARROW_RIGHT_ICON}
                      .onClick=${() => this.onGet(wallet.links.universal)}
                      data-testid="view-get-wallet-button-${wallet.id}"
                    >
                      Get
                    </w3m-button>
                  </div>
                </div>
              `
            )
          : null}
      </w3m-modal-content>

      <div class="w3m-footer-actions">
        <w3m-text variant="medium-regular">Not what you're looking for?</w3m-text>
        <w3m-text variant="small-thin" color="secondary" class="w3m-info-text">
          With hundreds of wallets out there, there's something for everyone
        </w3m-text>
        <w3m-button
          .onClick=${UiUtil.openWalletExplorerUrl}
          .iconRight=${SvgUtil.ARROW_UP_RIGHT_ICON}
          data-testid="view-get-wallet-explorer-button"
        >
          Explore Wallets
        </w3m-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-get-wallet-view': W3mGetWalletView
  }
}
