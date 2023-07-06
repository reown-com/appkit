import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xs' | 'xxs'> = 'md'

  @property() public backgroundColor: ColorType = 'blue-100'

  @property() public iconColor: ColorType = 'blue-100'

  @property() public icon: IconType = 'copy'

  // -- Render -------------------------------------------- //
  public render() {
    let iconSize: SizeType = 'xxs'
    switch (this.size) {
      case 'lg':
        iconSize = 'lg'
        break
      case 'md':
        iconSize = 'xs'
        break
      default:
        iconSize = 'xxs'
    }

    this.style.cssText = `
      --wui-bg-value: var(--wui-color-${this.backgroundColor});
      background-color: ${
        this.size === 'lg'
          ? `color-mix(in srgb, var(--wui-bg-value) 12%, transparent);`
          : `color-mix(in srgb, var(--wui-bg-value) 16%, transparent);`
      }
      border-radius: ${
        this.size === 'lg' ? `var(--wui-border-radius-3xl);` : `var(--wui-border-radius-xxs);`
      }
      width: ${`var(--wui-icon-box-size-${this.size});`}
      height: ${`var(--wui-icon-box-size-${this.size});`}
  `

    return html` <wui-icon color=${this.iconColor} size=${iconSize} name=${this.icon}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
