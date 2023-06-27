import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles, colorStyles } from '../../utils/ThemeUtil'
import '../wui-icon'
import styles from './styles'
import type { Size } from '../../utils/TypesUtil'
import type { Color } from '../../utils/TypesUtil'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<Size, 'xs' | 'xxs'> = 'md'

  @property() public backgroundColor: Color = 'blue-100'

  @property() public iconColor: Color = 'blue-100'

  // -- render ------------------------------------------------------- //
  public render() {
    let iconSize: Size = 'xxs'
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

    const backgroundClasses = {
      [`wui-opacity-${this.size === 'lg' ? 'sm' : 'md'}`]: true,
      [`wui-bg-color-${this.backgroundColor}`]: true
    }

    const sizeClass = `wui-size-${this.size}`

    return html`
      <div class="${sizeClass}">
        <div class="${classMap(backgroundClasses)}"></div>
        <wui-icon color=${this.iconColor} size=${iconSize}><slot></slot></wui-icon>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
