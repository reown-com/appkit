import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-image'
import '../../components/wui-icon'
import styles from './styles'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder'
import type { Size } from '../../utils/TypesUtil'

@customElement('wui-wallet-image')
export class WuiWalletImage extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<Size, 'inherit' | 'xs' | 'xxs'> = 'md'

  @property() public walletName = ''

  @property() public src?: string

  // -- render ------------------------------------------------------- //
  public render() {
    const sizeClass = `wui-size-${this.size}`

    const walletVisual = this.src
      ? html`<wui-image src=${this.src} alt=${this.walletName}></wui-image>`
      : html`<wui-icon size="inherit" color="inherit">${walletPlaceholderSvg}</wui-icon>`

    return html` <div class=${sizeClass}>${walletVisual}</div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-image': WuiWalletImage
  }
}
