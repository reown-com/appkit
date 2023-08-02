import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { BackgroundType, ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xxs'> = 'md'

  @property() public backgroundColor: ColorType = 'blue-100'

  @property() public iconColor: ColorType = 'blue-100'

  @property() public background: BackgroundType = 'transparent'

  @property({ type: Boolean }) public border? = false

  @property() public icon: IconType = 'copy'

  // -- Render -------------------------------------------- //
  public override render() {
    let iconSize: SizeType = 'xxs'
    switch (this.size) {
      case 'lg':
        iconSize = 'lg'
        break
      case 'md':
        iconSize = 'md'
        break
      case 'sm':
        iconSize = 'xs'
        break
      default:
        iconSize = 'xxs'
    }
    const isLg = this.size === 'lg'
    const bgMix = isLg ? '12%' : '16%'
    const borderRadius = isLg ? 'xxs' : '3xl'
    const isOpaque = this.background === 'opaque'
    const isColorChange =
      (this.backgroundColor === 'blue-100' && isOpaque) ||
      (this.backgroundColor === 'success-100' && isOpaque) ||
      (this.backgroundColor === 'error-100' && isOpaque) ||
      (this.backgroundColor === 'inverse-100' && isOpaque)

    this.style.cssText = `
       --local-bg-value: ${
         isColorChange
           ? `var(--wui-icon-box-bg-${this.backgroundColor})`
           : `var(--wui-color-${this.backgroundColor})`
       };
       --local-bg-mix: ${isColorChange ? `100%` : bgMix};
       --local-border-radius: var(--wui-border-radius-${borderRadius});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: 2px solid ${this.border ? `var(--wui-color-bg-125)` : `transparent`}
   `

    return html` <wui-icon color=${this.iconColor} size=${iconSize} name=${this.icon}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
