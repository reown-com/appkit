import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public walletId = ''
  @property() public label?: string = undefined
  @property() public src?: string = undefined
  @property() public installed? = false
  @property() public recent? = false

  // -- private ------------------------------------------------------ //
  private sublabelTemplate() {
    if (this.recent) {
      return html`
        <w3m-text class="w3m-sublabel" variant="xxsmall-bold" color="tertiary">RECENT</w3m-text>
      `
    } else if (this.installed) {
      return html`
        <w3m-text class="w3m-sublabel" variant="xxsmall-bold" color="tertiary">INSTALLED</w3m-text>
      `
    }

    return null
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button @click=${this.onClick}>
        <div>
          <w3m-wallet-image walletId=${this.walletId} .src=${this.src}></w3m-wallet-image>
          <w3m-text variant="xsmall-normal">
            ${this.label ?? UiUtil.getWalletFirstName(this.name)}
          </w3m-text>

          ${this.sublabelTemplate()}
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
