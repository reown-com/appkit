import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import type { IWalletImage } from '../../utils/TypesUtil'
import '../wui-wallet-image'
import styles from './styles'

const TOTAL_IMAGES = 4

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages: IWalletImage[] = []

  // -- Render -------------------------------------------- //
  public render() {
    return html`${this.walletImages
      .slice(0, TOTAL_IMAGES)
      .map(
        ({ src, walletName }) => html`
          <wui-wallet-image size="inherit" imageSrc=${src} name=${walletName}></wui-wallet-image>
        `
      )}${[...Array(TOTAL_IMAGES - this.walletImages.length)].map(
      () => html` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`
    )}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
