import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonSize, ButtonVariant, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular-mono',
  md: 'md-regular-mono',
  sm: 'sm-regular-mono'
}

const SPINNER_SIZE_BY_SIZE = {
  lg: 'md',
  md: 'md',
  sm: 'sm'
}

// -- Component ------------------------------------------ //
@customElement('wui-button')
export class WuiButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public size: ButtonSize = 'lg'

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public fullWidth = false

  @property({ type: Boolean }) public loading = false

  @property() public variant: ButtonVariant = 'accent-primary'

  @property() public textVariant?: TextType

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
    --local-width: ${this.fullWidth ? '100%' : 'auto'};
     `

    const textVariant = this.textVariant ?? (TEXT_VARIANT_BY_SIZE[this.size] as TextType)

    return html`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${textVariant} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `
  }

  public loadingTemplate() {
    if (this.loading) {
      const size = SPINNER_SIZE_BY_SIZE[this.size]
      const color =
        this.variant === 'neutral-primary' || this.variant === 'accent-primary'
          ? 'invert'
          : 'primary'

      return html`<wui-loading-spinner color=${color} size=${size}></wui-loading-spinner>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-button': WuiButton
  }
}
