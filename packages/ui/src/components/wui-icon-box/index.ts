import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../wui-icon'
import type { Size as IconSize } from '../wui-icon'
import styles from './styles'

type BackgroundSize = 'lg' | 'md' | 'sm'

type Color =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-300'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: BackgroundSize = 'md'

  @property() public backgroundColor: Color = 'blue-100'

  @property() public iconColor: Color = 'blue-100'

  // -- render ------------------------------------------------------- //
  public render() {
    let iconSize: IconSize = 'xxs'
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
      [`wui-color-${this.backgroundColor}`]: true
    }

    const sizeClasses = {
      [`wui-size-${this.size}`]: true
    }

    return html`
      <div class="${classMap(sizeClasses)}">
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
