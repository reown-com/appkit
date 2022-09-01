import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { getWalletName } from '../../utils/Helpers'
import { global } from '../../utils/Theme'
import '../w3m-wallet-image'
import styles from './styles'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-wallet-button-wrap">
        <button class="w3m-wallet-button" @click=${this.onClick}>
          <w3m-wallet-image name=${this.name}></w3m-wallet-image>
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
