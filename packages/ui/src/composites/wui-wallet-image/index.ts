import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-image'
import '../../components/wui-icon'
import styles from './styles'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder'
import type { SizeType } from '../../utils/TypesUtil'

@customElement('wui-wallet-image')
export class WuiWalletImage extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<SizeType, 'xs' | 'xxs'> = 'md'

  @property() public walletName = ''

  @property() public src?: string

  // -- render ------------------------------------------------------- //
  public render() {
    const sizeClass = `wui-size-${this.size}`

    return html` <div class=${sizeClass}>${this.templateVisual()}</div> `
  }

  private templateVisual() {
    if (this.src) {
      return html`<wui-image src=${this.src} alt=${this.walletName}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="inherit">${walletPlaceholderSvg}</wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-image': WuiWalletImage
  }
}
