import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonLinkVariant, ButtonSize, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const TEXT_VARIANT_BY_SIZE = {
  sm: 'sm-medium',
  md: 'md-medium'
} as const

const TEXT_COLOR_BY_VARIANT = {
  accent: 'accent-primary',
  secondary: 'secondary'
} as const

@customElement('wui-link')
export class WuiLink extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<ButtonSize, 'lg'> = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public variant: ButtonLinkVariant = 'accent'

  @property() public icon?: IconType = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${TEXT_COLOR_BY_VARIANT[this.variant]}
          variant=${TEXT_VARIANT_BY_SIZE[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private iconTemplate() {
    if (!this.icon) {
      return null
    }

    return html`<wui-icon name=${this.icon} size="sm"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-link': WuiLink
  }
}
