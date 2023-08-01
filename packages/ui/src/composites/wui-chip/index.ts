import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ChipType, IconType } from '../../utils/TypesUtil'
import { UiHelperUtil } from '../../utils/UiHelperUtils'
import styles from './styles'

@customElement('wui-chip')
export class WuiChip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: ChipType = 'fill'

  @property() public imageSrc?: string = undefined

  @property() public icon: IconType = 'externalLink'

  @property() public href = ''

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.variant === 'transparent' ? 'small-600' : 'paragraph-600'

    return html`
      <a rel="noreferrer" target="_blank" href=${this.href} data-variant=${this.variant}>
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
