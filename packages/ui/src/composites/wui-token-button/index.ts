import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-shimmer/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonSize, IconSizeType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular',
  md: 'lg-regular',
  sm: 'md-regular'
}

const ICON_SIZE_BY_SIZE = {
  lg: 'lg',
  md: 'md',
  sm: 'sm'
} as Record<ButtonSize, IconSizeType>

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: 'lg' | 'md' | 'sm' = 'md'

  @property() public imageSrc?: string

  @property() public chainImageSrc?: string

  @property({ type: Boolean }) public disabled = false

  @property() public text = ''

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.loading) {
      return html` <wui-flex alignItems="center" gap="01" padding="01">
        <wui-shimmer width="20px" height="20px"></wui-shimmer>
        <wui-shimmer width="32px" height="18px" borderRadius="4xs"></wui-shimmer>
      </wui-flex>`
    }

    return html`
      <button ?disabled=${this.disabled} data-size=${this.size}>
        ${this.imageTemplate()} ${this.textTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.imageSrc && this.chainImageSrc) {
      return html`<wui-flex class="left-image-container">
        <wui-image src=${this.imageSrc} class="token-image"></wui-image>
        <wui-image src=${this.chainImageSrc} class="chain-image"></wui-image>
      </wui-flex>`
    }

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} class="token-image"></wui-image>`
    }

    const iconSize = ICON_SIZE_BY_SIZE[this.size]

    return html`<wui-flex class="left-icon-container">
      <wui-icon size=${iconSize} name="networkPlaceholder"></wui-icon>
    </wui-flex>`
  }

  private textTemplate() {
    const textVariant = TEXT_VARIANT_BY_SIZE[this.size]

    return html`<wui-text color="primary" variant=${textVariant as TextType}
      >${this.text}</wui-text
    >`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
