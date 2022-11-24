import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import { getWalletFirstName } from '../../utils/UiHelpers'
import styles from './styles.css'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public walletId = ''
  @property() public label?: string = undefined
  @property() public src?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button class="w3m-wallet-button" @click=${this.onClick}>
        <div class="w3m-wallet-button-wrap">
          <w3m-wallet-image walletId=${this.walletId} .src=${this.src}></w3m-wallet-image>
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
