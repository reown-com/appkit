import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-text'
import '../../components/wui-image'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ChipType, IconType } from '../../utils/TypesUtil'
import styles from './styles'
import { removeUrlPrefix } from '../../utils/HelperUtils'

@customElement('wui-chip')
export class WuiChip extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: ChipType = 'fill'

  @property() public imageSrc? = ''

  @property() public icon: IconType = 'externalLink'

  @property() public href = ''

  // -- Render -------------------------------------------- //
  public render() {
    const textVariant = this.variant === 'transparent' ? 'small-600' : 'paragraph-600'

    return html`
      <a rel="noreferrer" target="_blank" href=${this.href} variant=${this.variant}>
        ${this.imageTemplate()}
        <wui-text variant=${textVariant} color="inherit"> ${removeUrlPrefix(this.href)} </wui-text>
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
