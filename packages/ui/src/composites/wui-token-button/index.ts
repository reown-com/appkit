import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular',
  md: 'lg-regular',
  sm: 'md-regular'
}

const ICON_SIZE_BY_SIZE = {
  lg: 'mdl',
  md: 'md',
  sm: 'sm'
}

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: 'lg' | 'md' | 'sm' = 'md'

  @property() public imageSrc?: string

  @property({ type: Boolean }) public disabled = false

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} data-size=${this.size}>
        ${this.imageTemplate()} ${this.textTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    const iconSize = ICON_SIZE_BY_SIZE[this.size]

    return html` <wui-flex class="left-icon-container">
      <wui-icon size=${iconSize as SizeType} name="networkPlaceholder"></wui-icon>
    </wui-flex>`
  }

  private textTemplate() {
    const textVariant = TEXT_VARIANT_BY_SIZE[this.size]

    return html`<wui-text variant=${textVariant as TextType}>${this.text}</wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
