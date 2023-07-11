import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import type { SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-wallet-image')
export class WuiWalletImage extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'xs' | 'xxs'> = 'md'

  @property() public name = ''

  @property() public imageSrc?: string

  // -- Render -------------------------------------------- //
  public render() {
    const sizeClass = `wui-size-${this.size}`

    return html` <div class=${sizeClass}>${this.templateVisual()}</div> `
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="inherit" name="walletPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-image': WuiWalletImage
  }
}
