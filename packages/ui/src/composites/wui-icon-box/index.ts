import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  BackgroundType,
  ColorType,
  IconBoxBorderType,
  IconType,
  SizeType
} from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xxs'> = 'md'

  @property() public backgroundColor: ColorType = 'accent-100'

  @property() public iconColor: ColorType = 'accent-100'

  @property() public background: BackgroundType = 'transparent'

  @property({ type: Boolean }) public border? = false

  @property() public borderColor?: IconBoxBorderType = 'wui-color-bg-125'

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
      (this.backgroundColor === 'accent-100' && isOpaque) ||
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
       --local-border: ${this.borderColor === 'wui-color-bg-125' ? `2px` : `1px`} solid ${
         this.border ? `var(--${this.borderColor})` : `transparent`
       }
   `

    return html` <wui-icon color=${this.iconColor} size=${iconSize} name=${this.icon}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
