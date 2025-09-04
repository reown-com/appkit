import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconSizeType, SelectSize, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular',
  md: 'md-regular',
  sm: 'sm-regular'
}

const ICON_SIZE_BY_SIZE = {
  lg: 'lg',
  md: 'md',
  sm: 'sm'
} as Record<SelectSize, IconSizeType>

@customElement('wui-select')
export class WuiSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  @property() public text = ''

  @property() public size: SelectSize = 'lg'

  @property() public type: 'filled-dropdown' | 'text-dropdown' = 'text-dropdown'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`
  }

  // -- Private ------------------------------------------- //
  private textTemplate() {
    const textSize = TEXT_VARIANT_BY_SIZE[this.size]

    if (this.text) {
      return html`<wui-text color="primary" variant=${textSize as TextType}>${this.text}</wui-text>`
    }

    return null
  }

  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`
    }

    const iconSize = ICON_SIZE_BY_SIZE[this.size]

    return html` <wui-flex class="left-icon-container">
      <wui-icon size=${iconSize} name="networkPlaceholder"></wui-icon>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-select': WuiSelect
  }
}
