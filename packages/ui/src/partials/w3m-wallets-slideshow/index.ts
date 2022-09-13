import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { DEFI_IMG, ETH_IMG, NFT_IMG } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-wallets-slideshow')
export class W3mWalletsSlideshow extends LitElement {
  public static styles = [global, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-slideshow-container">
        <div class="w3m-images">${DEFI_IMG} ${NFT_IMG} ${ETH_IMG}</div>
        <w3m-text variant="large-bold">A home for your digital assets</w3m-text>
        <w3m-text variant="medium-thin" align="center" color="secondary" class="w3m-info-text">
          A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs
        </w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallets-slideshow': W3mWalletsSlideshow
  }
}
