import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static styles = [resetStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: SizeType = 'md'

  @property() public color: ColorType = 'fg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      [`wui-size-${this.size}`]: true,
      [`wui-color-${this.color}`]: true
    }

    return html`<slot class="${classMap(classes)}"></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
