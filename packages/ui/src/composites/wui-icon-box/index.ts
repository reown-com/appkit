import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-icon'
import styles from './styles'
import type { Size } from '../../utils/TypesUtil'
import type { Color } from '../../utils/TypesUtil'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<Size, 'inherit' | 'xs' | 'xxs'> = 'md'

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

    const classes = {
      [`wui-size-${this.size}`]: true,
      [`wui-overlay-${this.size === 'lg' ? 'sm' : 'md'}`]: true
    }

    const bgColorStyle = `--wui-bg-value: var(--wui-color-${this.backgroundColor});`

    return html`
      <div class="wui-overlay-default ${classMap(classes)}" style=${bgColorStyle}>
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
