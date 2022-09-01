import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { getWalletIcon, getWalletName } from '../../utils/Helpers'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div class="w3m-wallet-button-wrap">
        <button class="w3m-wallet-button" @click=${this.onClick}>
          <img loading="lazy" decoding="async" src=${getWalletIcon(this.name)} alt=${this.name} />
        </button>

        <w3m-text variant="xsmall-normal">${getWalletName(this.name)}</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
