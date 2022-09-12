import { ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { WALLET_CONNECT_ICON_GRADIENT, WALLET_CONNECT_ICON_SHADE } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import '../w3m-text'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-walletconnect-button')
export class W3mWalletConnectButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = Object.values(ExplorerCtrl.state.wallets.listings)
    const scrollWallets = [...wallets, ...wallets]

    return html`
      ${dynamicStyles()}

      <button @click=${this.onClick}>
        <div class="w3m-button-container">
          <div class="w3m-wc-button-logo">
            ${WALLET_CONNECT_ICON_SHADE} ${WALLET_CONNECT_ICON_GRADIENT}
          </div>

          <div class="w3m-carousel-container">
            <div class="w3m-wc-button-carousel">
              ${scrollWallets.map(
                ({ image_url }) =>
                  html`
                    <div class="w3m-wc-button-carousel-item">
                      <img src=${image_url.lg} loading="lazy" />
                    </div>
                  `
              )}
            </div>
          </div>
        </div>

        <w3m-text variant="xsmall-normal">WalletConnect</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-walletconnect-button': W3mWalletConnectButton
  }
}
