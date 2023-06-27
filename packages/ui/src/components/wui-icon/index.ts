import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import styles from './styles'

export type Size = 'lg' | 'md' | 'sm' | 'xs' | 'xxs'

type Color =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-300'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Size = 'md'

  @property() public color: Color = 'fg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const sizeClasses = {
      [`wui-size-${this.size}`]: true
    }

    const colorClasses = {
      [`wui-color-${this.color}`]: true
    }

    return html`
      <i class=${classMap(sizeClasses)}>
        <slot class=${classMap(colorClasses)}></slot>
      </i>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
