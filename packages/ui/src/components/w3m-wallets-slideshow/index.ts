import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-wallets-slideshow')
export class W3mWalletsSlideshow extends LitElement {
  public static styles = [global, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-text variant="large-bold">Scan with your phone</w3m-text>
      <w3m-text variant="medium-thin" align="center" color="secondary" class="w3m-info-text">
        Open Coinbase Wallet on your phone and scan the code to connect
      </w3m-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallets-slideshow': W3mWalletsSlideshow
  }
}
