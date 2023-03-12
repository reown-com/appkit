import { CoreUtil, ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
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
    const { recomendedWallets } = ExplorerCtrl.state
    const customWallets = UiUtil.getCustomWallets().slice(0, 6)
    const isRecomendedWallets = recomendedWallets.length
    const isCustomWallets = customWallets.length

    return html`
      <w3m-modal-header title="Get a wallet"></w3m-modal-header>
      <w3m-modal-content>
        ${isRecomendedWallets
          ? recomendedWallets.map(
              ({ name, image_url, homepage }) =>
                html`
                  <div class="w3m-wallet-item">
                    <w3m-wallet-image src=${image_url.lg}></w3m-wallet-image>
                    <div class="w3m-wallet-content">
                      <w3m-text variant="medium-regular">${name}</w3m-text>
                      <w3m-button
                        .iconRight=${SvgUtil.ARROW_RIGHT_ICON}
                        .onClick=${() => this.onGet(homepage)}
                      >
                        Get
                      </w3m-button>
                    </div>
                  </div>
                `
            )
          : null}
        ${isCustomWallets
          ? customWallets.map(
              ({ name, id, links }) =>
                html`
                  <div class="w3m-wallet-item">
                    <w3m-wallet-image walletId=${id}></w3m-wallet-image>
                    <div class="w3m-wallet-content">
                      <w3m-text variant="medium-regular">${name}</w3m-text>
                      <w3m-button
                        .iconRight=${SvgUtil.ARROW_RIGHT_ICON}
                        .onClick=${() => this.onGet(links.universal)}
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
