import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import styles from './styles'

export interface WalletImage {
  src: string
  walletName: string
}

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property({ type: Array }) public walletImages: WalletImage[] = []

  // -- render ------------------------------------------------------- //
  public render() {
    const walletImagesHtml = this.walletImages.map(walletImage =>
      this.renderWalletImage(walletImage.src, walletImage.walletName)
    )

    return html` <div>${walletImagesHtml}</div> `
  }

  private renderWalletImage(src: string, alt: string) {
    return html` <wui-wallet-image size="inherit" src=${src} alt=${alt}></wui-wallet-image> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
