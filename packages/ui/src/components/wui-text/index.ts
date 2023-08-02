import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, TextAlign, TextType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TextType = 'paragraph-500'

  @property() public color: ColorType = 'fg-300'

  @property() public align?: TextAlign = 'left'

  // -- Render -------------------------------------------- //
  public override render() {
    const classes = {
      [`wui-font-${this.variant}`]: true,
      [`wui-color-${this.color}`]: true
    }

    this.style.cssText = `--local-align: ${this.align}`

    return html`<slot class=${classMap(classes)}></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-text': WuiText
  }
}
