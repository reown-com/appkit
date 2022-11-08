import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { global, color } from '../../utils/Theme'
import { getWalletIcon } from '../../utils/UiHelpers'
import styles from './styles.scss'

@customElement('w3m-wallet-image')
export class W3mWalletImage extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- state & properties ------------------------------------------- //
  @property() public name = ''
  @property() public src?: string = undefined

  protected dynamicStyles() {
    const { overlay } = color()

    return html` <style>
      .w3m-wallet-image::after {
        border: 1px solid ${overlay.thin};
      }
    </style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

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
