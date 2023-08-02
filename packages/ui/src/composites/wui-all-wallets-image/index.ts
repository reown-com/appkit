import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { IWalletImage } from '../../utils/TypesUtil.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

const TOTAL_IMAGES = 4

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages: IWalletImage[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    const isPlaceholders = this.walletImages.length < TOTAL_IMAGES

    return html`${this.walletImages
      .slice(0, TOTAL_IMAGES)
      .map(
        ({ src, walletName }) => html`
          <wui-wallet-image
            size="inherit"
            imageSrc=${src}
            name=${ifDefined(walletName)}
          ></wui-wallet-image>
        `
      )}
    ${isPlaceholders
      ? [...Array(TOTAL_IMAGES - this.walletImages.length)].map(
          () => html` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`
        )
      : null}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
