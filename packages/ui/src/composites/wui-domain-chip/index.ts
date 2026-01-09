import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { DomainChipSize, DomainChipVariant, IconType, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants --------------------------------------------------------------- //
const ICON_BY_VARIANT = {
  success: 'sealCheck',
  warning: 'exclamationCircle',
  error: 'warning'
} as Record<DomainChipVariant, IconType>

const FONT_BY_SIZE = {
  sm: 'sm-regular',
  md: 'md-regular'
} as Record<DomainChipSize, TextType>

@customElement('wui-domain-chip')
export class WuiDomainChip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: DomainChipVariant = 'success'

  @property() public size: DomainChipSize = 'md'

  @property() public imageSrc = ''

  @property({ type: Boolean }) public disabled = false

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} data-variant=${this.variant} data-size=${this.size}>
        <wui-icon name=${ICON_BY_VARIANT[this.variant]}></wui-icon>
        ${this.text
          ? html`<wui-text variant=${FONT_BY_SIZE[this.size]} color="inherit"
              >${this.text}</wui-text
            >`
          : null}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wui-domain-chip': WuiDomainChip
  }
}
