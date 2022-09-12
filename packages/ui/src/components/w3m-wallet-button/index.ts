import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { global } from '../../utils/Theme'
import { getWalletFirstName } from '../../utils/UiHelpers'
import '../w3m-wallet-image'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public label?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <button class="w3m-wallet-button" @click=${this.onClick}>
        <div class="w3m-wallet-button-wrap">
          <w3m-wallet-image name=${this.name}></w3m-wallet-image>
          <w3m-text variant="xsmall-normal">
            ${this.label ?? getWalletFirstName(this.name)}
          </w3m-text>
        </div>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
