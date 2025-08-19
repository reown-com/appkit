import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ChipButtonSize, ChipButtonType, IconType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants --------------------------------------------------------------- //
const FONT_BY_SIZE = {
  sm: 'sm-regular',
  md: 'md-regular',
  lg: 'lg-regular'
} as Record<ChipButtonSize, TextType>

@customElement('wui-chip-button')
export class WuiChipButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: ChipButtonType = 'accent'

  @property() public size: ChipButtonSize = 'md'

  @property() public imageSrc = ''

  @property({ type: Boolean }) public disabled = false

  @property() public leftIcon?: IconType = undefined

  @property() public rightIcon?: IconType = undefined

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} data-type=${this.type} data-size=${this.size}>
        ${this.imageSrc ? html`<wui-image src=${this.imageSrc}></wui-image>` : null}
        ${this.leftIcon
          ? html`<wui-icon name=${this.leftIcon} color="inherit" size="inherit"></wui-icon>`
          : null}
        <wui-text variant=${FONT_BY_SIZE[this.size]} color="inherit">${this.text}</wui-text>
        ${this.rightIcon
          ? html`<wui-icon name=${this.rightIcon} color="inherit" size="inherit"></wui-icon>`
          : null}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-chip-button': WuiChipButton
  }
}
