import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../wui-wallet-image'
import styles from './styles'
import type { IWalletImage } from '../../utils/TypesUtil'

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property({ type: Array }) public walletImages: IWalletImage[] = []

  @state() public totalImages = 4

  // -- render ------------------------------------------------------- //
  public render() {
    return html`${this.templateWalletImages()}`
  }

  private templateWalletImages() {
    const renderedImages = this.walletImages
      .slice(0, this.totalImages)
      .map(
        ({ src, walletName }) => html`
          <wui-wallet-image size="inherit" src=${src} walletName=${walletName}></wui-wallet-image>
        `
      )

    const remainingImages = this.totalImages - renderedImages.length
    for (let i = 0; i < remainingImages; i += 1) {
      renderedImages.push(html`<wui-wallet-image size="inherit" walletName=""></wui-wallet-image>`)
    }

    return renderedImages
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
