import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles, colorStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import type { ColorType } from '../../utils/TypesUtil'
import type { SizeType } from '../../utils/TypesUtil'

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

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
