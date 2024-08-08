import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType, LineClamp, TextAlign, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TextType = 'paragraph-500'

  @property() public color: ColorType = 'fg-300'

  @property() public align?: TextAlign = 'left'

  @property() public lineClamp?: LineClamp = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    const classes = {
      [`wui-font-${this.variant}`]: true,
      [`wui-color-${this.color}`]: true,
      // eslint-disable-next-line no-unneeded-ternary
      [`wui-line-clamp-${this.lineClamp}`]: this.lineClamp ? true : false
    }

    this.style.cssText = `
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `

    return html`<slot class=${classMap(classes)}></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-text': WuiText
  }
}
