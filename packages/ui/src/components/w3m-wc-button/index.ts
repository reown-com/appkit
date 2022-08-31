import { ExplorerCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { WALLET_CONNECT_ICON_GRADIENT, WALLET_CONNECT_ICON_SHADE } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wc-button')
export class W3mWcButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = Object.values(ExplorerCtrl.state.wallets.listings)

    return html`
      ${dynamicStyles()}

      <button class="w3m-wc-button" @click=${this.onClick}>
        <div class="w3m-wc-button-container">
          <div class="w3m-wc-button-logo">
            ${WALLET_CONNECT_ICON_SHADE} ${WALLET_CONNECT_ICON_GRADIENT}
          </div>
          <div class="w3m-wc-button-carousel">
            ${wallets.map(
              ({ image_url }) =>
                html`<div class="w3m-wc-button-carousel-item">
                  <img src=${image_url.md} loading="lazy" decoding="async" />
                </div>`
            )}
          </div>
        </div>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-button': W3mWcButton
  }
}
