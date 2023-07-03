import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles, colorStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import type { ColorType, TextType } from '../../utils/TypesUtil'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant: TextType = 'paragraph-500'

  @property() public color: ColorType = 'fg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      [`wui-font-${this.variant}`]: true,
      [`wui-color-${this.color}`]: true
    }

    return html` <slot class=${classMap(classes)}></slot> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-text': WuiText
  }
}
