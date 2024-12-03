import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ChipButtonSize, ChipButtonVariant, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants --------------------------------------------------------------- //
const FONT_BY_SIZE = {
  sm: 'sm-regular',
  md: 'md-regular'
}

@customElement('wui-chip-button')
export class WuiChipButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: ChipButtonVariant = 'accent'

  @property() public size: ChipButtonSize = 'md'

  @property() public imageSrc = ''

  @property({ type: Boolean }) public disabled = false

  @property() public icon: IconType = 'externalLink'

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} data-variant=${this.variant} data-size=${this.size}>
        ${this.imageSrc ? html`<wui-image src=${this.imageSrc}></wui-image>` : null}
        <wui-text variant=${FONT_BY_SIZE[this.size]} color="inherit">${this.text}</wui-text>
        <wui-icon name=${this.icon} color="inherit" size="inherit"></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-chip-button': WuiChipButton
  }
}
