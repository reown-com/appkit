import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public label = ''
  @property() public imgUrl = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div class="w3m-wallet-button-wrap">
        <button class="w3m-wallet-button" @click=${this.onClick}>
          <img loading="lazy" decoding="async" src=${this.imgUrl} alt=${this.label} />
        </button>

        <w3m-text variant="xsmall-normal" align="center">${this.label}</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
