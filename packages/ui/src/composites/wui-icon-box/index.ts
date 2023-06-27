import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-icon'
import styles from './styles'
import type { Size } from '../../utils/TypesUtil'
import type { Color } from '../../utils/TypesUtil'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [globalStyles, styles]

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

    const sizeClass = `wui-size-${this.size}`
    const opacityValue = this.size === 'lg' ? '12%' : '16%'

    return html`
      <div
        class="${sizeClass}"
        style="background-color: var(--wui-rgba-transparent);
            background-color: color-mix(in srgb, var(--wui-color-${this
          .backgroundColor}) ${opacityValue}, transparent);"
      >
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
