/* eslint-disable no-nested-ternary */
import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  BackgroundType,
  ColorType,
  IconBoxBorderType,
  IconType,
  SizeType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property() public backgroundColor: ColorType = 'accent-100'

  @property() public iconColor: ColorType = 'accent-100'

  @property() public iconSize?: Exclude<SizeType, 'inherit'>

  @property() public background: BackgroundType = 'transparent'

  @property({ type: Boolean }) public border? = false

  @property() public borderColor?: IconBoxBorderType = 'wui-color-bg-125'

  @property() public icon: IconType = 'copy'

  // -- Render -------------------------------------------- //
  public override render() {
    const iconSize = this.iconSize || this.size
    const isLg = this.size === 'lg'
    const isXl = this.size === 'xl'

    const bgMix = isLg ? '12%' : '16%'
    const borderRadius = isLg ? 'xxs' : isXl ? 's' : '3xl'
    const isGray = this.background === 'gray'
    const isOpaque = this.background === 'opaque'
    const isColorChange =
      (this.backgroundColor === 'accent-100' && isOpaque) ||
      (this.backgroundColor === 'success-100' && isOpaque) ||
      (this.backgroundColor === 'error-100' && isOpaque) ||
      (this.backgroundColor === 'inverse-100' && isOpaque)

    let bgValueVariable = `var(--wui-color-${this.backgroundColor})`

    if (isColorChange) {
      bgValueVariable = `var(--wui-icon-box-bg-${this.backgroundColor})`
    } else if (isGray) {
      bgValueVariable = `var(--wui-gray-${this.backgroundColor})`
    }

    this.style.cssText = `
       --local-bg-value: ${bgValueVariable};
       --local-bg-mix: ${isColorChange || isGray ? `100%` : bgMix};
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
