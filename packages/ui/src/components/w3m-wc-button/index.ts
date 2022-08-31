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
    return html`
      ${dynamicStyles()}

      <button class="w3m-wc-button" @click=${this.onClick}>
        <div class="w3m-wc-button-container">
          <div class="w3m-wc-button-logo">
            ${WALLET_CONNECT_ICON_SHADE} ${WALLET_CONNECT_ICON_GRADIENT}
          </div>
          <div class="w3m-wc-button-carousel">
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
            <div class="w3m-wc-button-carousel-item"></div>
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
