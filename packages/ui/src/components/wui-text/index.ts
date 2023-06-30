import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles, colorStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import type { ColorType } from '../../utils/TypesUtil'

type Variant =
  | 'lg-medium'
  | 'lg-semibold'
  | 'md-bold'
  | 'md-medium'
  | 'md-numerals'
  | 'md-semibold'
  | 'sm-medium'
  | 'sm-semibold'
  | 'xxs-bold'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant: Variant = 'md-medium'

  @property() public color: ColorType = 'fssg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      [`wui-${this.variant}`]: true,
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
