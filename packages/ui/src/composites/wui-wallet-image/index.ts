import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import type { BorderRadiusType, SizeType } from '../../utils/TypesUtil'
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
    let borderRadius: BorderRadiusType = 'xxs'
    if (this.size === 'lg') {
      borderRadius = 'm'
    } else if (this.size === 'md') {
      borderRadius = 'xs'
    } else {
      borderRadius = 'xxs'
    }
    this.style.cssText = `
       --local-border-radius: var(--wui-border-radius-${borderRadius});
       --local-size: var(--wui-wallet-image-size-${this.size});
   `

    return html` ${this.templateVisual()}`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon
      parentSize=${this.size}
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-image': WuiWalletImage
  }
}
