import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { getWalletIcon } from '../../utils/Helpers'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-image')
export class W3mWalletButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public name = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div class="w3m-wallet-image">
        <img loading="lazy" decoding="async" src=${getWalletIcon(this.name)} alt=${this.name} />
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-image': W3mWalletButton
  }
}
