import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  IconType,
  SemanticChipSize,
  SemanticChipType,
  SizeType,
  TextType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const TEXT_BY_SIZE = {
  sm: 'md-regular',
  md: 'lg-regular',
  lg: 'lg-regular'
} as Record<SizeType, TextType>

const ICON_BY_TYPE = {
  success: 'sealCheck',
  error: 'warning',
  warning: 'exclamationCircle'
} as Record<SemanticChipType, IconType>

@customElement('wui-semantic-chip')
export class WuiSemanticChip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: SemanticChipType = 'success'

  @property() public size: SemanticChipSize = 'md'

  @property() public imageSrc?: string = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public href = ''

  @property() public text?: string = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <a
        rel="noreferrer"
        target="_blank"
        href=${this.href}
        class=${this.disabled ? 'disabled' : ''}
        data-type=${this.type}
        data-size=${this.size}
      >
        ${this.imageTemplate()}
        <wui-text variant=${TEXT_BY_SIZE[this.size]} color="inherit">${this.text}</wui-text>
      </a>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} size="inherit"></wui-image>`
    }

    return html`<wui-icon
      name=${ICON_BY_TYPE[this.type]}
      weight="fill"
      color="inherit"
      size="inherit"
      class="image-icon"
    ></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-semantic-chip': WuiSemanticChip
  }
}
