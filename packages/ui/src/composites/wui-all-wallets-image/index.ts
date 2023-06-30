import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../wui-wallet-image'
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
    return this.walletImages.map(
      ({ src, walletName }) =>
        html`<wui-wallet-image
          size="inherit"
          src=${src}
          walletName=${walletName}
        ></wui-wallet-image>`
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
