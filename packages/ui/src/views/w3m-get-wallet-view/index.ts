import { ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-text'
import '../../components/w3m-wallet-image'
import { ARROW_RIGHT_ICON, ARROW_UP_RIGHT_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly explorerUrl = 'https://explorer.walletconnect.com/'

  private onGet(url: string) {
    window.open(url, '_blank')
  }

  private onExplore() {
    window.open(this.explorerUrl, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = Object.values(ExplorerCtrl.state.wallets.listings).slice(0, 4)

    return html`
      ${dynamicStyles()}

      <w3m-modal-header title="Get a wallet"></w3m-modal-header>
      <w3m-modal-content>
        ${wallets.map(
          ({ name, image_url, homepage }) =>
            html`
              <div class="w3m-walle-item">
                <w3m-wallet-image name=${name} src=${image_url.lg}></w3m-wallet-image>
                <div class="w3m-wallet-content">
                  <w3m-text variant="large-bold">${name}</w3m-text>
                  <w3m-button .iconRight=${ARROW_RIGHT_ICON} .onClick=${() => this.onGet(homepage)}>
                    Get
                  </w3m-button>
                </div>
              </div>
            `
        )}
      </w3m-modal-content>
      <w3m-modal-footer>
        <w3m-text variant="large-bold">Not what you're looking for?</w3m-text>
        <w3m-text variant="medium-thin" align="center" color="secondary" class="w3m-info-text">
          With hundreds of wallets out there, there's something for everyone
        </w3m-text>
        <w3m-button
          .onClick=${this.onExplore.bind(this)}
          variant="ghost"
          .iconRight=${ARROW_UP_RIGHT_ICON}
        >
          Explore Wallets
        </w3m-button>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-get-wallet-view': W3mGetWalletView
  }
}
