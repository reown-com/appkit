import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ChipType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-chip-button')
export class WuiChipButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: ChipType = 'fill'

  @property() public imageSrc = ''

  @property({ type: Boolean }) public disabled = false

  @property() public icon: IconType = 'externalLink'

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    const isSmall =
      this.variant === 'success' || this.variant === 'transparent' || this.variant === 'shadeSmall'
    const textVariant = isSmall ? 'small-600' : 'paragraph-600'

    return html`
      <button class=${this.disabled ? 'disabled' : ''} data-variant=${this.variant}>
        <wui-image src=${this.imageSrc}></wui-image>
        <wui-text variant=${textVariant} color="inherit"> ${this.text} </wui-text>
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
