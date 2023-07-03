import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../wui-wallet-image'
import styles from './styles'
import type { IWalletImage } from '../../utils/TypesUtil'

const TOTAL_IMAGES = 4

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property({ type: Array }) public walletImages: IWalletImage[] = []

  // -- render ------------------------------------------------------- //
  public render() {
    return html`${this.walletImages
      .slice(0, TOTAL_IMAGES)
      .map(
        ({ src, walletName }) => html`
          <wui-wallet-image size="inherit" src=${src} walletName=${walletName}></wui-wallet-image>
        `
      )}${[...Array(TOTAL_IMAGES - this.walletImages.length)].map(
      () => html` <wui-wallet-image size="inherit" walletName=""></wui-wallet-image>`
    )}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
