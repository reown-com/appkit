import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ChipType, IconType } from '../../utils/TypesUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtils.js'
import styles from './styles.js'

@customElement('wui-chip')
export class WuiChip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: ChipType = 'fill'

  @property() public imageSrc?: string = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public icon: IconType = 'externalLink'

  @property() public href = ''

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.variant === 'transparent' ? 'small-600' : 'paragraph-600'

    return html`
      <a
        rel="noreferrer"
        target="_blank"
        href=${this.href}
        class=${this.disabled ? 'disabled' : ''}
        data-variant=${this.variant}
      >
        ${this.imageTemplate()}
        <wui-text variant=${textVariant} color="inherit">
          ${UiHelperUtil.getHostName(this.href)}
        </wui-text>
        <wui-icon name=${this.icon} color="inherit" size="inherit"></wui-icon>
      </a>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-chip': WuiChip
  }
}
