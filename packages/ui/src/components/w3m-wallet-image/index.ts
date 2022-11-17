import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import { getWalletIcon } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-image')
export class W3mWalletImage extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public id = ''
  @property() public src?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div class="w3m-wallet-image">
        <img src=${this.src ?? getWalletIcon(this.id)} alt=${this.id} />
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-image': W3mWalletImage
  }
}
