import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import { getWalletIcon } from '../../utils/UiHelpers'
import styles from './styles.css'

@customElement('w3m-wallet-image')
export class W3mWalletImage extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public name = ''
  @property() public src?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-wallet-image">
        <img src=${this.src ?? getWalletIcon(this.name)} alt=${this.name} />
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-image': W3mWalletImage
  }
}
